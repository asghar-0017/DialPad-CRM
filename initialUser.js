const bcrypt = require('bcryptjs');
const dataSource = require('./src/infrastructure/psql');
const AdminAuth = require('./src/entities/auth');
const generateAdminId = require('./src/utils/token'); 
require('dotenv').config();

const initializeAdmin = async () => {
  try {
    // await dataSource.initialize();

    const adminRepository = dataSource.getRepository(AdminAuth);
    const admin = await adminRepository.findOne({ where: { userName: 'admin' } });

    if (!admin) {
      const adminId =786
      const hashedPassword = await bcrypt.hash('admin', 10);
      const newAdmin = adminRepository.create({
        userName: 'admin',
        password: hashedPassword,
        email: process.env.ADMIN_EMAIL,
        adminId: adminId,
      });

      await adminRepository.save(newAdmin);
      console.log('Initial admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error.message);
  } finally {
    await dataSource.destroy();
  }
};

module.exports=initializeAdmin