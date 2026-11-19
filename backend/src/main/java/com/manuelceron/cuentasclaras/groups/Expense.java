package com.manuelceron.cuentasclaras.groups;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_code")
    private BillGroup group;

    @Column(nullable = false)
    private String description;

    @Column(name = "amount_minor", nullable = false)
    private long amountMinor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payer_id")
    private Member payer;

    @ManyToMany
    @JoinTable(name = "expense_participants",
            joinColumns = @JoinColumn(name = "expense_id"),
            inverseJoinColumns = @JoinColumn(name = "member_id"))
    private Set<Member> participants = new HashSet<>();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Expense() {
    }

    public Expense(BillGroup group, String description, long amountMinor, Member payer, Set<Member> participants, Instant createdAt) {
        this.group = group;
        this.description = description;
        this.amountMinor = amountMinor;
        this.payer = payer;
        this.participants = participants;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getDescription() { return description; }
    public long getAmountMinor() { return amountMinor; }
    public Member getPayer() { return payer; }
    public Instant getCreatedAt() { return createdAt; }

    /** Participants in join order, which is the order the split uses. */
    public List<Member> participantsInOrder() {
        return participants.stream().sorted(Comparator.comparingInt(Member::getPosition)).toList();
    }
}
