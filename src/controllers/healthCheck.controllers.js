import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const healthCheck = asyncHandler(async (req, res, next) => {
  res.status(200).json(new ApiResponse(200, "Server is healthy"));
});

// const healthCheck = async (req, res, next) => {
//   try {
//     res.status(200).json(new ApiResponse(200, "Server is healthy"));
//   } catch (error) {
//     next(error);
//   }
// };

export { healthCheck };
