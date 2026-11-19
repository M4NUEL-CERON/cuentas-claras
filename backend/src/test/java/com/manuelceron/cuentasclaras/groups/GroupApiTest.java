package com.manuelceron.cuentasclaras.groups;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Runs the real app against H2 (PostgreSQL mode) with the same Flyway migration production uses. */
@SpringBootTest
class GroupApiTest {

    @Autowired
    WebApplicationContext context;

    MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    private ResultActions post_(String url, String json) throws Exception {
        return mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private String createTrip(String currency) throws Exception {
        String body = post_("/api/groups", "{\"name\":\"Paseo a Guatapé\",\"currency\":\"" + currency + "\",\"members\":[\"Ana\",\"Beto\",\"Cami\"]}")
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.code");
    }

    private long memberId(String code, int index) throws Exception {
        String body = mvc.perform(get("/api/groups/" + code)).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.members[" + index + "].id")).longValue();
    }

    @Test
    void aTripFromCreationToSettlement() throws Exception {
        String code = createTrip("COP");
        long ana = memberId(code, 0), beto = memberId(code, 1), cami = memberId(code, 2);

        post_("/api/groups/" + code + "/expenses",
                "{\"description\":\"Lancha\",\"amount\":90000,\"payerId\":" + ana + ",\"participantIds\":[" + ana + "," + beto + "," + cami + "]}")
                .andExpect(status().isCreated());
        post_("/api/groups/" + code + "/expenses",
                "{\"description\":\"Almuerzo\",\"amount\":30000,\"payerId\":" + beto + ",\"participantIds\":[" + beto + "," + cami + "]}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(120000))
                .andExpect(jsonPath("$.expenses.length()").value(2))
                .andExpect(jsonPath("$.settlements.length()").value(2))
                .andExpect(jsonPath("$.settlements[0].fromId").value(cami))
                .andExpect(jsonPath("$.settlements[0].toId").value(ana))
                .andExpect(jsonPath("$.settlements[0].amount").value(45000))
                .andExpect(jsonPath("$.settlements[1].fromId").value(beto))
                .andExpect(jsonPath("$.settlements[1].amount").value(15000));

        // the link is case-insensitive, since people retype it
        mvc.perform(get("/api/groups/" + code.toUpperCase())).andExpect(status().isOk());
    }

    @Test
    void deletingAnExpenseUpdatesTheBalances() throws Exception {
        String code = createTrip("USD");
        long ana = memberId(code, 0), beto = memberId(code, 1);
        String body = post_("/api/groups/" + code + "/expenses",
                "{\"description\":\"Taxi\",\"amount\":12.50,\"payerId\":" + ana + ",\"participantIds\":[" + ana + "," + beto + "]}")
                .andExpect(jsonPath("$.balances[0].net").value(6.25))
                .andReturn().getResponse().getContentAsString();
        long expense = ((Number) JsonPath.read(body, "$.expenses[0].id")).longValue();

        mvc.perform(delete("/api/groups/" + code + "/expenses/" + expense))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expenses.length()").value(0))
                .andExpect(jsonPath("$.settlements.length()").value(0));
        mvc.perform(delete("/api/groups/" + code + "/expenses/" + expense)).andExpect(status().isNotFound());
    }

    @Test
    void addsMembersButRejectsDuplicates() throws Exception {
        String code = createTrip("COP");
        post_("/api/groups/" + code + "/members", "{\"name\":\"Dani\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.members.length()").value(4));
        post_("/api/groups/" + code + "/members", "{\"name\":\"  ana \"}").andExpect(status().isConflict());
    }

    @Test
    void rejectsBadInput() throws Exception {
        String code = createTrip("COP");
        long ana = memberId(code, 0);

        for (String bad : List.of(
                "{\"name\":\"x\",\"currency\":\"BTC\",\"members\":[\"A\",\"B\"]}",
                "{\"name\":\"x\",\"currency\":\"COP\",\"members\":[\"Solo\"]}",
                "{\"name\":\"x\",\"currency\":\"COP\",\"members\":[\"Ana\",\"ana\"]}",
                "{\"name\":\"\",\"currency\":\"COP\",\"members\":[\"A\",\"B\"]}")) {
            post_("/api/groups", bad).andExpect(status().isBadRequest());
        }

        String url = "/api/groups/" + code + "/expenses";
        post_(url, "{\"description\":\"Pan\",\"amount\":1500.5,\"payerId\":" + ana + ",\"participantIds\":[" + ana + "]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("COP amounts have no decimals"));
        post_(url, "{\"description\":\"Pan\",\"amount\":-5,\"payerId\":" + ana + ",\"participantIds\":[" + ana + "]}").andExpect(status().isBadRequest());
        post_(url, "{\"description\":\"Pan\",\"amount\":5000,\"payerId\":999999,\"participantIds\":[" + ana + "]}").andExpect(status().isBadRequest());
        post_(url, "{\"description\":\"Pan\",\"amount\":5000,\"payerId\":" + ana + ",\"participantIds\":[]}").andExpect(status().isBadRequest());
        post_(url, "{\"description\":\"Pan\",\"amount\":5000,\"payerId\":" + ana + ",\"participantIds\":[999999]}").andExpect(status().isBadRequest());

        mvc.perform(get("/api/groups/nopenopeno")).andExpect(status().isNotFound());
    }
}
