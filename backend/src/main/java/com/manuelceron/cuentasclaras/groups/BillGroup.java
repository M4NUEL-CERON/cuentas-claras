package com.manuelceron.cuentasclaras.groups;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** A group of people sharing expenses. Its random code is the share link, so it doubles as the access key. */
@Entity
@Table(name = "bill_groups")
public class BillGroup {

    @Id
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String currency;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position")
    private List<Member> members = new ArrayList<>();

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt, id")
    private List<Expense> expenses = new ArrayList<>();

    protected BillGroup() {
    }

    public BillGroup(String code, String name, String currency, Instant createdAt) {
        this.code = code;
        this.name = name;
        this.currency = currency;
        this.createdAt = createdAt;
    }

    public Member addMember(String memberName) {
        Member m = new Member(this, memberName, members.size());
        members.add(m);
        return m;
    }

    public String getCode() { return code; }
    public String getName() { return name; }
    public String getCurrency() { return currency; }
    public List<Member> getMembers() { return members; }
    public List<Expense> getExpenses() { return expenses; }
}
