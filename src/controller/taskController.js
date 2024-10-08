const taskService = require("../service/taskService");
const path = require("path");
const xlsx = require("xlsx");
const generateId = require("../utils/token");
const fs = require("fs");

const isPascalCase = (str) => {
  return /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/.test(str); // Matches only PascalCase format
};

const toPascalCase = (str) => {
  if (isPascalCase(str)) {
    return str;
  }
  const words = str.match(/[A-Za-z][a-z]*/g) || [];

  const pascalCaseStr = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join("");

  // Special cases for customer feedback
  if (
    ["customer", "feedback", "customerfeedback", "feedbackcustomer"].includes(
      pascalCaseStr.toLowerCase()
    )
  ) {
    return "CustomerFeedBack";
  }

  return pascalCaseStr;
};

const convertKeysToPascalCase = (data) => {
  const result = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const pascalCaseKey = toPascalCase(key);
      result[pascalCaseKey] = data[key];
    }
  }
  return result;
};

const taskController = {
  saveExcelFileData: async (io, req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file." });
    }

    const filePath = path.join(__dirname, "../uploads/", req.file.filename);

    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const results = xlsx.utils.sheet_to_json(sheet);

      if (results.length === 0) {
        return res
          .status(400)
          .json({ message: "No data found in the Excel file." });
      }

      const taskCreate = [];
      for (const row of results) {
        const convertedRow = convertKeysToPascalCase(row);
        const taskData = {
          ...convertedRow,
          PhoneNumber: convertedRow.PhoneNumber
            ? String(convertedRow.PhoneNumber)
            : undefined,
          leadId: generateId(),
        };
        const formattedTask = {
          ...taskData,
          ...convertedRow,
          status: "progress",
        };
        console.log("Lead Data:", formattedTask);

        console.log("Lead Data:", taskData);

        const uploadTask = await taskService.createTaskService(taskData);
        taskCreate.push(formattedTask); // Push formattedTask into taskCreate
      }

      if (taskCreate.length > 0) {
        // io.emit('send_message', uploadTask);
        return res
          .status(200)
          .json({ message: "Task Uploaded successfully", data: taskCreate });
      } else {
        return res
          .status(400)
          .json({
            message: "No Tasks were created due to missing data or errors.",
          });
      }
    } catch (error) {
      console.error("Error processing the Excel file:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    } finally {
      fs.unlinkSync(filePath);
    }
  },
  getTaskData: async (io, req, res) => {
    try {
      const data = await taskService.getTaskFromDb();
      console.log("Data", data);

      const transformedData = data.map((task) => {
        if (task.DynamicData) {
          return {
            ...task.DynamicData,
          };
        }
        return task;
      });

      res.status(200).send({ message: "Success", data: transformedData });
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },

  deleteRemainingTasks: async (io, req, res) => {
    try {
      const deleteData = await taskService.deleteData();

      res
        .status(200)
        .send({ message: "data Deleted SuccessFully", data: deleteData });
    } catch (error) {
      console.error("Error deleting tasks:", error.message);
      throw error;
    }
  },
};

module.exports = taskController;
