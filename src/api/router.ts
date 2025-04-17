import express from 'express';
import authRoutes from '@api/routes/auth.route';
import commonRoutes from '@api/routes/common.route';
import employeeRoutes from '@api/routes/employee.route';
import userRoutes from '@api/routes/user.route';
import permissionRoutes from '@api/routes/permission.route';
import permissionGroupRoutes from '@api/routes/permission-group.route';
import deviceRequestRoutes from '@api/routes/device-request.route';
import partnerRoutes from '@api/routes/partner.route';
import partnerGroupRoutes from '@api/routes/partner-group.route';
import organizationRoutes from '@api/routes/organization.route';
import positionRoutes from '@api/routes/position.route';
import jobPositionRoutes from '@api/routes/job-position.route';
import bankRoutes from '@api/routes/bank.route';
import clauseRoutes from '@api/routes/clause.route';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { UserDeviceMiddleware } from './middlewares/user-device.middleware';

const router = express.Router();

router.use('/common', commonRoutes);
router.use(UserDeviceMiddleware.getUserDevice);
router.use('/auth', authRoutes);
router.use(AuthMiddleware.authenticate);
router.use('/employee', employeeRoutes);
router.use('/user', userRoutes);
router.use('/bank', bankRoutes);
router.use('/device-request', deviceRequestRoutes);
router.use('/permission', permissionRoutes);
router.use('/permission-group', permissionGroupRoutes);
router.use('/partner', partnerRoutes);
router.use('/partner-group', partnerGroupRoutes);
router.use('/organization', organizationRoutes);
router.use('/position', positionRoutes);
router.use('/job-position', jobPositionRoutes);

router.use('/clause', clauseRoutes);
export default router;
