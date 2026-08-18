package me.dwaragesh.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth

                        // ── AUTHENTICATED-ONLY profile sub-paths ────────────────────────────
                        // These MUST be declared BEFORE the public {userName} wildcard below,
                        // otherwise Spring Security will match e.g. GET /api/profile/analytics
                        // as a public profile view where {userName} = "analytics".
                        .requestMatchers("/api/profile/analytics").authenticated()
                        .requestMatchers("/api/profile/check-username").authenticated()
                        .requestMatchers("/api/profile/pfp").authenticated()
                        .requestMatchers("/api/profile/pfp/**").authenticated()
                        .requestMatchers("/api/profile/platforms").authenticated()
                        .requestMatchers("/api/profile/platforms/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/profile").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/profile").authenticated()

                        // ── PUBLIC profile endpoints ─────────────────────────────────────────
                        // Only GET on /api/profile/{userName} and its /export sub-path are public.
                        .requestMatchers(HttpMethod.GET, "/api/profile/{userName}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/profile/{userName}/export").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/profile/{userName}/contributions").permitAll()

                        // ── PUBLIC static/asset endpoints ────────────────────────────────────
                        .requestMatchers("/api/banners").permitAll()
                        .requestMatchers("/api/images/**").permitAll()

                        // ── EVERYTHING ELSE under /api requires authentication ────────────────
                        .requestMatchers("/api/**").authenticated()

                        // Allow non-API routes (OAuth redirects, static files, etc.)
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl(frontendUrl + "/?login=success", true)
                )
                .logout(logout -> logout
                        .logoutRequestMatcher(request ->
                                request.getServletPath().equals("/logout") &&
                                request.getMethod().equals("GET"))
                        .logoutSuccessUrl(frontendUrl + "/?logout=success")
                        .permitAll()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized\"}");
                        })
                )
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                )
                .addFilterAfter(
                        new CsrfCookieFilter(),
                        org.springframework.security.web.authentication.www.BasicAuthenticationFilter.class
                );

        return http.build();
    }
}
