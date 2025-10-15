# Comic Reader Dashboard - JPA Version Migration Guide

## Architecture Overview

### Frontend: Next.js with TypeScript
- Dashboard với RBAC (Role-Based Access Control)
- Admin: Full permissions (manga + user management)
- Moderator: Content management only (no user management)
- User: Read-only access

### Backend: Jakarta EE 11 với JPA/Hibernate
- JPA Entities cho database mapping
- Repository pattern với EntityManager
- MySQL Database với JPA annotations
- JWT Authentication
- RBAC Implementation

### Database: MySQL
- Managed bởi JPA/Hibernate
- Auto schema generation
- Relationship mapping với annotations

## Jakarta EE 11 JPA Backend Structure

### 1. Project Structure
```
Comic-Backend-JPA/
├── src/main/java/
│   └── com/comicreader/
│       ├── config/
│       │   ├── JPAConfig.java
│       │   └── CorsFilter.java
│       ├── entity/
│       │   ├── User.java
│       │   ├── Role.java
│       │   ├── Permission.java
│       │   ├── Manga.java
│       │   ├── Chapter.java
│       │   ├── Page.java
│       │   ├── Genre.java
│       │   └── ActivityLog.java
│       ├── repository/
│       │   ├── BaseRepository.java
│       │   ├── UserRepository.java
│       │   ├── RoleRepository.java
│       │   ├── MangaRepository.java
│       │   └── ActivityLogRepository.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── UserService.java
│       │   ├── MangaService.java
│       │   └── DashboardService.java
│       ├── servlet/
│       │   ├── AuthServlet.java
│       │   ├── UserServlet.java
│       │   ├── MangaServlet.java
│       │   └── DashboardServlet.java
│       ├── security/
│       │   ├── JWTUtil.java
│       │   ├── RBACFilter.java
│       │   └── PasswordUtil.java
│       └── dto/
│           ├── UserDTO.java
│           ├── MangaDTO.java
│           └── LoginRequest.java
├── src/main/resources/
│   └── META-INF/
│       └── persistence.xml
├── src/main/webapp/
│   └── WEB-INF/
│       └── web.xml
└── pom.xml
```

### 2. Maven Dependencies (pom.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.comicreader</groupId>
    <artifactId>comic-backend-jpa</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging>
    
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <jakarta.version>11.0.0</jakarta.version>
        <hibernate.version>6.4.4.Final</hibernate.version>
    </properties>
    
    <dependencies>
        <!-- Jakarta EE 11 -->
        <dependency>
            <groupId>jakarta.platform</groupId>
            <artifactId>jakarta.jakartaee-api</artifactId>
            <version>${jakarta.version}</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- JPA/Hibernate -->
        <dependency>
            <groupId>org.hibernate.orm</groupId>
            <artifactId>hibernate-core</artifactId>
            <version>${hibernate.version}</version>
        </dependency>
        
        <dependency>
            <groupId>org.hibernate.orm</groupId>
            <artifactId>hibernate-entitymanager</artifactId>
            <version>${hibernate.version}</version>
        </dependency>
        
        <!-- MySQL Connector -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        
        <!-- Connection Pool -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>5.0.1</version>
        </dependency>
        
        <!-- JSON Processing -->
        <dependency>
            <groupId>org.glassfish</groupId>
            <artifactId>jakarta.json</artifactId>
            <version>2.0.1</version>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
        </dependency>
        
        <!-- Password Hashing -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-crypto</artifactId>
            <version>6.1.4</version>
        </dependency>
        
        <!-- Bean Validation -->
        <dependency>
            <groupId>org.hibernate.validator</groupId>
            <artifactId>hibernate-validator</artifactId>
            <version>8.0.1.Final</version>
        </dependency>
        
        <!-- Logging -->
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.4.11</version>
        </dependency>
        
        <!-- MapStruct for DTO mapping -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>1.5.5.Final</version>
        </dependency>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct-processor</artifactId>
            <version>1.5.5.Final</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>1.5.5.Final</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
            
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.3.2</version>
            </plugin>
        </plugins>
    </build>
</project>
```

### 3. JPA Configuration (persistence.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="https://jakarta.ee/xml/ns/persistence"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="https://jakarta.ee/xml/ns/persistence 
             https://jakarta.ee/xml/ns/persistence/persistence_3_0.xsd"
             version="3.0">
    
    <persistence-unit name="comic-reader-pu" transaction-type="RESOURCE_LOCAL">
        <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>
        
        <class>com.comicreader.entity.User</class>
        <class>com.comicreader.entity.Role</class>
        <class>com.comicreader.entity.Permission</class>
        <class>com.comicreader.entity.Manga</class>
        <class>com.comicreader.entity.Chapter</class>
        <class>com.comicreader.entity.Page</class>
        <class>com.comicreader.entity.Genre</class>
        <class>com.comicreader.entity.ActivityLog</class>
        
        <properties>
            <!-- Database connection -->
            <property name="jakarta.persistence.jdbc.driver" value="com.mysql.cj.jdbc.Driver"/>
            <property name="jakarta.persistence.jdbc.url" value="jdbc:mysql://localhost:3306/comic_reader?useSSL=false&amp;allowPublicKeyRetrieval=true&amp;serverTimezone=UTC"/>
            <property name="jakarta.persistence.jdbc.user" value="root"/>
            <property name="jakarta.persistence.jdbc.password" value="password"/>
            
            <!-- Hibernate properties -->
            <property name="hibernate.dialect" value="org.hibernate.dialect.MySQL8Dialect"/>
            <property name="hibernate.hbm2ddl.auto" value="update"/>
            <property name="hibernate.show_sql" value="true"/>
            <property name="hibernate.format_sql" value="true"/>
            <property name="hibernate.use_sql_comments" value="true"/>
            
            <!-- Connection pool -->
            <property name="hibernate.connection.provider_class" value="com.zaxxer.hikari.hibernate.HikariConnectionProvider"/>
            <property name="hibernate.hikari.minimumIdle" value="5"/>
            <property name="hibernate.hikari.maximumPoolSize" value="20"/>
            <property name="hibernate.hikari.idleTimeout" value="300000"/>
            <property name="hibernate.hikari.connectionTimeout" value="30000"/>
            <property name="hibernate.hikari.maxLifetime" value="1800000"/>
            
            <!-- Cache settings -->
            <property name="hibernate.cache.use_second_level_cache" value="true"/>
            <property name="hibernate.cache.use_query_cache" value="true"/>
            <property name="hibernate.cache.region.factory_class" value="org.hibernate.cache.jcache.JCacheRegionFactory"/>
            
            <!-- Performance settings -->
            <property name="hibernate.jdbc.batch_size" value="25"/>
            <property name="hibernate.order_inserts" value="true"/>
            <property name="hibernate.order_updates" value="true"/>
            <property name="hibernate.jdbc.batch_versioned_data" value="true"/>
        </properties>
    </persistence-unit>
</persistence>
```

## Key JPA Features

### 1. Entity Relationships
- **User ↔ Role**: Many-to-Many relationship
- **Role ↔ Permission**: Many-to-Many relationship  
- **Manga ↔ Genre**: Many-to-Many relationship
- **Manga → Chapter**: One-to-Many with cascade
- **Chapter → Page**: One-to-Many with cascade
- **User → ActivityLog**: One-to-Many for audit trail

### 2. JPA Annotations Used
- `@Entity`, `@Table` - Entity mapping
- `@Id`, `@GeneratedValue` - Primary key strategy
- `@ManyToMany`, `@OneToMany`, `@ManyToOne` - Relationships
- `@JoinTable`, `@JoinColumn` - Join configurations
- `@Cascade`, `@FetchType` - Relationship behaviors
- `@CreationTimestamp`, `@UpdateTimestamp` - Auto timestamps
- `@Enumerated` - Enum mapping
- `@Valid`, `@NotNull`, `@Email` - Bean validation

### 3. Repository Pattern
- Base repository với common CRUD operations
- Specific repositories cho mỗi entity
- Query methods với JPQL và Criteria API
- Pagination và sorting support
- Transaction management

### 4. DTO Pattern
- Separate DTOs cho API responses
- MapStruct để convert Entity ↔ DTO
- Validation annotations trên DTOs
- Prevent over-fetching và security issues

## Migration Benefits với JPA

1. **Code Simplification**: Ít boilerplate code hơn so với JDBC
2. **Type Safety**: Compile-time checking cho queries
3. **Relationship Management**: Auto handling của foreign keys
4. **Caching**: Second-level cache để optimize performance
5. **Database Independence**: Dễ dàng switch database engines
6. **Transaction Management**: Declarative transactions
7. **Lazy Loading**: Optimize memory usage
8. **Query Optimization**: Hibernate query optimization

Bạn có muốn tôi tạo các JPA entities và repositories không?