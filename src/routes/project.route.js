import { Router } from "express";
import {
  addMembersToProject,
  createProject,
  deleteMember,
  getProjects,
  getProjectById,
  deleteProject,
  getProjectMembers,
  updateMembersRole,
  updateProject,
} from "../controllers/project.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createProjectValidator,
  addMemebertoProjectValidator,
} from "../validators/index.js";

import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getProjectById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

router
  .route("/:projectId/members")
  .get(getProjectMembers)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMemebertoProjectValidator(),
    validate,
    addMembersToProject,
  );

router
  .route("/:projectId/members/:userId")
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMembersRole)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember);

export default router;
