package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    Optional<Profile> findFirstByUserName(String userName);
    Boolean existsByUserNameIgnoreCase(String username);
    Profile findByUser(User user);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT p.user_name FROM profile p WHERE EXISTS (" +
                "  SELECT 1 FROM unnest(p.socials) AS s" +
                "  WHERE s ILIKE 'LINKED_IN:' || :username" +
                "     OR s ILIKE 'LINKEDIN:' || :username" +
                "     OR s ILIKE '%LINKED_IN:%' || :username || '%'" +
                "     OR s ILIKE '%LINKEDIN:%' || :username || '%'" +
                ")",
        nativeQuery = true)
    java.util.List<String> findUserNameByLinkedin(@org.springframework.data.repository.query.Param("username") String username);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT p.user_name FROM profile p JOIN app_user u ON p.user_id = u.user_id WHERE LOWER(u.email) = LOWER(:email) " +
                "OR EXISTS (SELECT 1 FROM unnest(p.socials) AS s WHERE LOWER(s) = LOWER('MAIL:' || :email))",
        nativeQuery = true)
    java.util.List<String> findUserNameByMail(@org.springframework.data.repository.query.Param("email") String email);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT p.user_name FROM profile p WHERE EXISTS (" +
                "  SELECT 1 FROM unnest(p.socials) AS s" +
                "  WHERE LOWER(s) = LOWER('GITHUB:' || :username)" +
                ")",
        nativeQuery = true)
    java.util.List<String> findUserNameByGithub(@org.springframework.data.repository.query.Param("username") String username);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT p.user_name FROM profile p WHERE EXISTS (" +
                "  SELECT 1 FROM unnest(p.socials) AS s" +
                "  WHERE LOWER(s) = LOWER('LEETCODE:' || :username)" +
                ")",
        nativeQuery = true)
    java.util.List<String> findUserNameByLeetcode(@org.springframework.data.repository.query.Param("username") String username);
}
