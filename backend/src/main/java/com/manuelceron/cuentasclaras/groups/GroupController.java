package com.manuelceron.cuentasclaras.groups;

import com.manuelceron.cuentasclaras.groups.Dtos.CreateGroup;
import com.manuelceron.cuentasclaras.groups.Dtos.GroupView;
import com.manuelceron.cuentasclaras.groups.Dtos.NewExpense;
import com.manuelceron.cuentasclaras.groups.Dtos.NewMember;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Every write returns the whole updated group, so the UI never has to recompute balances itself. */
@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService service;

    public GroupController(GroupService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GroupView create(@Valid @RequestBody CreateGroup req) {
        return service.create(req);
    }

    @GetMapping("/{code}")
    public GroupView get(@PathVariable String code) {
        return service.get(code);
    }

    @PostMapping("/{code}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public GroupView addMember(@PathVariable String code, @Valid @RequestBody NewMember req) {
        return service.addMember(code, req.name());
    }

    @PostMapping("/{code}/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public GroupView addExpense(@PathVariable String code, @Valid @RequestBody NewExpense req) {
        return service.addExpense(code, req);
    }

    @DeleteMapping("/{code}/expenses/{expenseId}")
    public GroupView deleteExpense(@PathVariable String code, @PathVariable long expenseId) {
        return service.deleteExpense(code, expenseId);
    }
}
