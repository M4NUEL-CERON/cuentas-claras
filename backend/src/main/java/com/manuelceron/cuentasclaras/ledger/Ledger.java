package com.manuelceron.cuentasclaras.ledger;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

/**
 * The money math, free of persistence: who paid, who owes, and who pays whom.
 * All amounts are in minor units (cents, or whole pesos for COP), so nothing is ever rounded.
 */
public final class Ledger {

    private Ledger() {
    }

    /** One expense: the payer, the amount, and the participants in a fixed order (the order decides who absorbs leftover units). */
    public record Entry(long payer, long amount, List<Long> participants) {
    }

    public record Totals(long paid, long owed) {
        public long net() {
            return paid - owed;
        }
    }

    public record Transfer(long from, long to, long amount) {
    }

    /**
     * Paid and owed per member. Each expense splits evenly; when it does not divide exactly,
     * the leftover units go one each to the first participants, so shares always add up to the amount.
     */
    public static Map<Long, Totals> totals(List<Long> members, List<Entry> entries) {
        Map<Long, long[]> acc = new LinkedHashMap<>();
        for (long m : members) acc.put(m, new long[2]);
        for (Entry e : entries) {
            acc.get(e.payer())[0] += e.amount();
            int n = e.participants().size();
            long base = e.amount() / n;
            long leftover = e.amount() % n;
            for (int i = 0; i < n; i++) {
                acc.get(e.participants().get(i))[1] += base + (i < leftover ? 1 : 0);
            }
        }
        Map<Long, Totals> out = new LinkedHashMap<>();
        acc.forEach((m, v) -> out.put(m, new Totals(v[0], v[1])));
        return out;
    }

    /**
     * Turns net balances (which sum to zero) into transfers: the member who owes the most pays the member
     * who is owed the most, repeatedly. Each step settles at least one person, so there are at most n - 1 transfers.
     * Ties break by member id so the same balances always give the same plan.
     */
    public static List<Transfer> settle(Map<Long, Long> net) {
        Comparator<long[]> biggestFirst = Comparator.<long[]>comparingLong(a -> -a[1]).thenComparingLong(a -> a[0]);
        PriorityQueue<long[]> owed = new PriorityQueue<>(biggestFirst);
        PriorityQueue<long[]> owing = new PriorityQueue<>(biggestFirst);
        net.forEach((m, v) -> {
            if (v > 0) owed.add(new long[] {m, v});
            if (v < 0) owing.add(new long[] {m, -v});
        });

        List<Transfer> plan = new ArrayList<>();
        while (!owed.isEmpty() && !owing.isEmpty()) {
            long[] to = owed.poll();
            long[] from = owing.poll();
            long amount = Math.min(to[1], from[1]);
            plan.add(new Transfer(from[0], to[0], amount));
            if (to[1] > amount) owed.add(new long[] {to[0], to[1] - amount});
            if (from[1] > amount) owing.add(new long[] {from[0], from[1] - amount});
        }
        return plan;
    }
}
