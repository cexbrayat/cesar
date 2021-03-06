package org.mixit.cesar.repository;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static com.ninja_squad.dbsetup.Operations.sequenceOf;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.Date;
import javax.sql.DataSource;

import com.ninja_squad.dbsetup.DbSetup;
import com.ninja_squad.dbsetup.destination.DataSourceDestination;
import com.ninja_squad.dbsetup.generator.ValueGenerators;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mixit.cesar.model.security.OAuthProvider;
import org.mixit.cesar.model.security.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DataSourceTestConfig.class)
public class AccountRepositoryTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private AccountRepository accountRepository;

    @Before
    public void setUp() throws Exception {
        DbSetup dbSetup = new DbSetup(
                new DataSourceDestination(dataSource),
                sequenceOf(
                        DataTest.DELETE_ALL,
                        sequenceOf(
                                DataTest.INSERT_MEMBER,
                                insertInto("Account")
                                        .withGeneratedValue("id", ValueGenerators.sequence())
                                        .columns("oauthId", "login", "lastname", "firstname", "password", "token", "provider", "email", "MEMBER_ID", "valid")
                                        .values("oauthId", "devmind", "EHRET", "Guillaume", "toto", "token", "CESAR", "test@gmail.com", 1, true)
                                        .build(),
                                insertInto("Authority")
                                        .withGeneratedValue("id", ValueGenerators.sequence())
                                        .columns("name")
                                        .values(Role.ADMIN.toString())
                                        .build(),
                                insertInto("Account_Authority")
                                        .columns("ACCOUNT_ID", "AUTHORITIES_ID")
                                        .values(1, 1)
                                        .build()
                        )
                )
        );
        dbSetup.launch();
    }

    @Test
    public void findAccountByLogin(){
        assertThat(accountRepository.findByLogin("devmind").getEmail()).isEqualTo("test@gmail.com");
    }

    @Test
    public void findAccountByToken(){
        assertThat(accountRepository.findByToken("token").getEmail()).isEqualTo("test@gmail.com");
    }

    @Test
    public void findAccountByOauth(){
        assertThat(accountRepository.findByOauthProviderAndId(OAuthProvider.CESAR, "oauthId").getEmail()).isEqualTo("test@gmail.com");
    }
}