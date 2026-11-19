package com.manuelceron.cuentasclaras.groups;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Request and response shapes of the API. Amounts travel as decimals in the group's currency. */
public final class Dtos {

    private Dtos() {
    }

    public record CreateGroup(
            @NotBlank @Size(max = 60) String name,
            @NotBlank String currency,
            @NotNull @Size(min = 2, max = GroupService.MAX_MEMBERS) List<@NotBlank @Size(max = 30) String> members) {
    }

    public record NewMember(@NotBlank @Size(max = 30) String name) {
    }

    public record NewExpense(
            @NotBlank @Size(max = 80) String description,
            @NotNull @Positive BigDecimal amount,
            @NotNull Long payerId,
            @NotEmpty List<Long> participantIds) {
    }

    public record MemberView(long id, String name) {
    }

    public record ExpenseView(long id, String description, BigDecimal amount, long payerId, List<Long> participantIds, Instant createdAt) {
    }

    /** net = paid - owed: positive means the group owes this member money. */
    public record BalanceView(long memberId, BigDecimal paid, BigDecimal owed, BigDecimal net) {
    }

    public record TransferView(long fromId, long toId, BigDecimal amount) {
    }

    public record GroupView(String code, String name, String currency, BigDecimal total,
                            List<MemberView> members, List<ExpenseView> expenses,
                            List<BalanceView> balances, List<TransferView> settlements) {
    }
}
