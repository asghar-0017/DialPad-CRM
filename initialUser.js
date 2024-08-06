const bcrypt = require('bcryptjs');
const dataSource = require('./src/infrastructure/psql');
const AdminAuth = require('./src/entities/auth'); // Adjust this import according to your entities structure

const initializeAdmin = async () => {
  try {
    await dataSource.initialize();

    const adminRepository = dataSource.getRepository(AdminAuth);
    const admin = await adminRepository.findOne({ where: { userName: 'admin' } });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const newAdmin = adminRepository.create({ userName: 'admin', password: hashedPassword,email:'admin@softmarksolutions.com' });
      await adminRepository.save(newAdmin);
      console.log('Initial admin user created');
    } else {
      console.log('Admin user already exists');
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

initializeAdmin();
