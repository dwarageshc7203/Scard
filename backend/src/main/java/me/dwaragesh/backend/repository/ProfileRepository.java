package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {

    Optional<Profile> findFirstByUserName(String userName);

    Boolean existsByUserNameIgnoreCase(String username);

    Profile findByUser(User user);

    @Query(value = "SELECT p.user_name FROM profile p WHERE EXISTS (" +
                   "  SELECT 1 FROM unnest(p.socials) AS s" +
                   "  WHERE s ILIKE 'LINKED_IN:' || :username ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKED_IN:%/' || :username ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKED_IN:%/' || :username || '/%' ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKED_IN:%/' || :username || '?%' ESCAPE '\\'" +
                   "     OR s ILIKE 'LINKEDIN:' || :username ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKEDIN:%/' || :username ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKEDIN:%/' || :username || '/%' ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKEDIN:%/' || :username || '?%' ESCAPE '\\'" +
                   ")", nativeQuery = true)
    List<String> findUserNameByLinkedin(@Param("username") String username);

    @Query(value = "SELECT p.user_name FROM profile p JOIN app_user u ON p.user_id = u.user_id " +
                   "WHERE LOWER(u.email) = LOWER(:email) " +
                   "OR EXISTS (SELECT 1 FROM unnest(p.socials) AS s WHERE LOWER(s) = LOWER('MAIL:' || :email))",
           nativeQuery = true)
    List<String> findUserNameByMail(@Param("email") String email);

    @Query(value = "SELECT p.user_name FROM profile p " +
                   "WHERE LOWER('GITHUB:' || :username) = ANY(SELECT LOWER(x) FROM unnest(p.socials) AS x)",
           nativeQuery = true)
    List<String> findUserNameByGithub(@Param("username") String username);

    @Query(value = "SELECT p.user_name FROM profile p " +
                   "WHERE LOWER('LEETCODE:' || :username) = ANY(SELECT LOWER(x) FROM unnest(p.socials) AS x)",
           nativeQuery = true)
    List<String> findUserNameByLeetcode(@Param("username") String username);
}
