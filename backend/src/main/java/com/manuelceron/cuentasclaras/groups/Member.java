package com.manuelceron.cuentasclaras.groups;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_code")
    private BillGroup group;

    @Column(nullable = false)
    private String name;

    /** Join order; also decides who absorbs the leftover unit when an amount does not split evenly. */
    @Column(nullable = false)
    private int position;

    protected Member() {
    }

    Member(BillGroup group, String name, int position) {
        this.group = group;
        this.name = name;
        this.position = position;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public int getPosition() { return position; }
}
