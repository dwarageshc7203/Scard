import java.sql.*;
public class test2 {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/test", "dwaragesh", "dwarageshdc");
        Statement st = conn.createStatement();
        st.execute("insert into users (user_id, email, google_id) values (999, 'test@example.com', 'test@example.com') ON CONFLICT DO NOTHING");
        st.execute("insert into profile (user_id, user_name) values (999, 'testuser') ON CONFLICT DO NOTHING");
    }
}
