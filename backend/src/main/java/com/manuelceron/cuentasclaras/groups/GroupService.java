package com.manuelceron.cuentasclaras.groups;

import com.manuelceron.cuentasclaras.groups.Dtos.BalanceView;
import com.manuelceron.cuentasclaras.groups.Dtos.CreateGroup;
import com.manuelceron.cuentasclaras.groups.Dtos.ExpenseView;
import com.manuelceron.cuentasclaras.groups.Dtos.GroupView;
import com.manuelceron.cuentasclaras.groups.Dtos.MemberView;
import com.manuelceron.cuentasclaras.groups.Dtos.NewExpense;
import com.manuelceron.cuentasclaras.groups.Dtos.TransferView;
import com.manuelceron.cuentasclaras.ledger.Ledger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class GroupService {

    static final int MAX_MEMBERS = 30;
    static final int MAX_EXPENSES = 500;
    /** Ceiling per expense in minor units; keeps sums far from long overflow. */
    static final long MAX_AMOUNT_MINOR = 1_000_000_000_000L;

    /** Supported currencies and their decimals. COP and CLP are handled in whole units, as people actually pay. */
    static final Map<String, Integer> CURRENCIES = Map.of("COP", 0, "CLP", 0, "USD", 2, "EUR", 2, "MXN", 2, "PEN", 2, "ARS", 2);

    // no 0/o, 1/l/i: codes get read aloud and typed from chats
    private static final String ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
    private static final int CODE_LENGTH = 10;

    private final BillGroupRepository groups;
    private final SecureRandom random = new SecureRandom();
    private final Clock clock;

    public GroupService(BillGroupRepository groups, Clock clock) {
        this.groups = groups;
        this.clock = clock;
    }

    @Transactional
    public GroupView create(CreateGroup req) {
        String currency = req.currency().trim().toUpperCase(Locale.ROOT);
        if (!CURRENCIES.containsKey(currency)) throw ApiError.badRequest("Unsupported currency: " + currency);

        BillGroup g = new BillGroup(newCode(), req.name().trim(), currency, Instant.now(clock));
        Set<String> seen = new HashSet<>();
        for (String raw : req.members()) {
            String name = raw.trim();
            if (!seen.add(name.toLowerCase(Locale.ROOT))) throw ApiError.badRequest("Duplicate member name: " + name);
            g.addMember(name);
        }
        return view(groups.save(g));
    }

    @Transactional(readOnly = true)
    public GroupView get(String code) {
        return view(find(code));
    }

    @Transactional
    public GroupView addMember(String code, String rawName) {
        BillGroup g = find(code);
        String name = rawName.trim();
        if (g.getMembers().size() >= MAX_MEMBERS) throw ApiError.badRequest("A group can have at most " + MAX_MEMBERS + " members");
        if (g.getMembers().stream().anyMatch(m -> m.getName().equalsIgnoreCase(name))) throw ApiError.conflict("There is already a member called " + name);
        g.addMember(name);
        return view(groups.saveAndFlush(g));
    }

    @Transactional
    public GroupView addExpense(String code, NewExpense req) {
        BillGroup g = find(code);
        if (g.getExpenses().size() >= MAX_EXPENSES) throw ApiError.badRequest("A group can have at most " + MAX_EXPENSES + " expenses");

        Map<Long, Member> byId = new LinkedHashMap<>();
        g.getMembers().forEach(m -> byId.put(m.getId(), m));
        Member payer = byId.get(req.payerId());
        if (payer == null) throw ApiError.badRequest("The payer is not in this group");
        Set<Member> participants = new LinkedHashSet<>();
        for (Long id : req.participantIds()) {
            Member m = byId.get(id);
            if (m == null) throw ApiError.badRequest("A participant is not in this group");
            participants.add(m);
        }

        long minor = toMinor(req.amount(), g.getCurrency());
        g.getExpenses().add(new Expense(g, req.description().trim(), minor, payer, participants, Instant.now(clock)));
        return view(groups.saveAndFlush(g));
    }

    @Transactional
    public GroupView deleteExpense(String code, long expenseId) {
        BillGroup g = find(code);
        if (!g.getExpenses().removeIf(e -> e.getId() == expenseId)) throw ApiError.notFound("Expense not found");
        return view(groups.saveAndFlush(g));
    }

    private BillGroup find(String code) {
        return groups.findById(code.toLowerCase(Locale.ROOT)).orElseThrow(() -> ApiError.notFound("Group not found"));
    }

    private String newCode() {
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
            if (!groups.existsById(sb.toString())) return sb.toString();
        }
        throw new IllegalStateException("Could not generate a free group code");
    }

    static long toMinor(BigDecimal amount, String currency) {
        int scale = CURRENCIES.get(currency);
        BigDecimal minor = amount.movePointRight(scale);
        if (minor.stripTrailingZeros().scale() > 0) {
            throw ApiError.badRequest(scale == 0 ? currency + " amounts have no decimals" : currency + " amounts allow at most " + scale + " decimals");
        }
        if (minor.compareTo(BigDecimal.valueOf(MAX_AMOUNT_MINOR)) > 0) throw ApiError.badRequest("Amount is too large");
        return minor.longValueExact();
    }

    private static GroupView view(BillGroup g) {
        int scale = CURRENCIES.get(g.getCurrency());
        List<Long> memberIds = g.getMembers().stream().map(Member::getId).toList();
        List<Ledger.Entry> entries = g.getExpenses().stream()
                .map(e -> new Ledger.Entry(e.getPayer().getId(), e.getAmountMinor(), e.participantsInOrder().stream().map(Member::getId).toList()))
                .toList();
        Map<Long, Ledger.Totals> totals = Ledger.totals(memberIds, entries);
        Map<Long, Long> net = new LinkedHashMap<>();
        totals.forEach((id, t) -> net.put(id, t.net()));

        return new GroupView(
                g.getCode(), g.getName(), g.getCurrency(),
                money(g.getExpenses().stream().mapToLong(Expense::getAmountMinor).sum(), scale),
                g.getMembers().stream().map(m -> new MemberView(m.getId(), m.getName())).toList(),
                g.getExpenses().stream().map(e -> new ExpenseView(e.getId(), e.getDescription(), money(e.getAmountMinor(), scale),
                        e.getPayer().getId(), e.participantsInOrder().stream().map(Member::getId).toList(), e.getCreatedAt())).toList(),
                totals.entrySet().stream().map(en -> new BalanceView(en.getKey(), money(en.getValue().paid(), scale),
                        money(en.getValue().owed(), scale), money(en.getValue().net(), scale))).toList(),
                Ledger.settle(net).stream().map(t -> new TransferView(t.from(), t.to(), money(t.amount(), scale))).toList());
    }

    private static BigDecimal money(long minor, int scale) {
        return BigDecimal.valueOf(minor, scale);
    }
}
