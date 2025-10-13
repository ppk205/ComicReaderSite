import { apiService } from '../services/api';

// Test backend connection and endpoints
export class BackendTester {
  
  async testConnection(): Promise<boolean> {
    try {
      const isHealthy = await apiService.healthCheck();
      console.log('Backend health check:', isHealthy);
      return isHealthy;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  }

  async testLogin(username: string, password: string) {
    try {
      const result = await apiService.login(username, password);
      console.log('Login test result:', result);
      return result;
    } catch (error) {
      console.error('Login test failed:', error);
      throw error;
    }
  }

  async testDashboardData() {
    try {
      const [stats, activity] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentActivity()
      ]);
      
      console.log('Dashboard stats:', stats);
      console.log('Recent activity:', activity);
      
      return { stats, activity };
    } catch (error) {
      console.error('Dashboard data test failed:', error);
      throw error;
    }
  }

  async testMangaOperations() {
    try {
      // Test manga list
      const mangaList = await apiService.getMangaList(1, 10);
      console.log('Manga list:', mangaList);

      // Test create manga (if user has permission)
      const newManga = {
        title: 'Test Manga',
        description: 'This is a test manga',
        author: 'Test Author',
        genre: ['Action', 'Adventure'],
        status: 'ongoing'
      };

      try {
        const createdManga = await apiService.createManga(newManga);
        console.log('Created manga:', createdManga);
        return { mangaList, createdManga };
      } catch (createError) {
        console.log('Create manga failed (might be permission issue):', createError);
        return { mangaList };
      }
    } catch (error) {
      console.error('Manga operations test failed:', error);
      throw error;
    }
  }

  async testUserOperations() {
    try {
      // Test user list (admin only)
      const userList = await apiService.getUserList(1, 10);
      console.log('User list:', userList);

      return { userList };
    } catch (error) {
      console.error('User operations test failed (might be permission issue):', error);
      throw error;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('=== Backend Test Suite ===');
    
    // Test 1: Connection
    console.log('\n1. Testing connection...');
    const isConnected = await this.testConnection();
    
    if (!isConnected) {
      console.log('❌ Backend is not available. Using mock data.');
      return { success: false, message: 'Backend not available' };
    }
    
    console.log('✅ Backend connection successful');

    // Test 2: Dashboard data
    console.log('\n2. Testing dashboard data...');
    try {
      await this.testDashboardData();
      console.log('✅ Dashboard data test passed');
    } catch (error) {
      console.log('❌ Dashboard data test failed');
    }

    // Test 3: Manga operations
    console.log('\n3. Testing manga operations...');
    try {
      await this.testMangaOperations();
      console.log('✅ Manga operations test passed');
    } catch (error) {
      console.log('❌ Manga operations test failed');
    }

    // Test 4: User operations
    console.log('\n4. Testing user operations...');
    try {
      await this.testUserOperations();
      console.log('✅ User operations test passed');
    } catch (error) {
      console.log('❌ User operations test failed (might be permission issue)');
    }

    console.log('\n=== Test Suite Complete ===');
    return { success: true, message: 'All tests completed' };
  }
}

export const backendTester = new BackendTester();