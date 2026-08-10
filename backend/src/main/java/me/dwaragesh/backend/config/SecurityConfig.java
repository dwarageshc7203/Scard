package me.dwaragesh.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        // public: anyone can view a profile page, no login required
                        .requestMatchers("/api/profile/{userName}").permitAll()
                        // everything else under /api requires a logged-in session
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("http://localhost:5173/", true) // wherever your React dev server runs
                )
                .csrf(csrf -> csrf.disable()); // fine for a stateless-ish JSON API during dev; revisit before production

        return http.build();
    }
}
