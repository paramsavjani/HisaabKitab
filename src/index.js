import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { faker } from "@faker-js/faker";
import { User } from "./models/User.model.js";

const findUser = async () => {
  try {
    console.time("Find User Time");
    const user = await User.findOne({ username: "sdfsdf" });
    console.timeEnd("Find User Time");
    console.log("User found:", user);
  } catch (error) {
    console.error("Error finding user:", error);
  }
};

const createDummyUsers = async () => {
  const users = [];
  for (let i = 0; i < 1000000; i++) {
    const user = {
      username: faker.internet.userName(),
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    users.push(user);
  }
  try {
    await User.insertMany(users);
    console.log("100000 Dummy users created");
  } catch (error) {
    console.error("Error creating users:", error);
  }
};

const findUserById = async (id) => {
  try {
    const user = await User.findById(id); // Correct method for finding by ID
    if (user) {
      console.log("User found:", user);
    } else {
      console.log("User not found");
    }
  } catch (error) {
    console.error("Error finding user:", error);
  }
};

const run = async () => {
  // await createDummyUsers();
  // await findUser();
  // await findUserById("670aff23fc9f22126e907b6f");
  deleteAllUsers();
};

const deleteAllUsers = async () => {
  try {
    console.time("Delete Users Time");
    const result = await User.deleteMany({});
    console.timeEnd("Delete Users Time");
    console.log(`${result.deletedCount} users deleted.`);
  } catch (error) {
    console.error("Error deleting users:", error);
  }
};

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
      const startTime = Date.now();
      run().then(() => {
        const endTime = Date.now();
        const timeTaken = endTime - startTime;
        console.log(`Time taken to run the function: ${timeTaken}ms`);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
