import React, { useState, useContext, useEffect } from "react";
import UserContext from "../context/UserContext";

const InputField = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  errorMessage,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-white">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full px-3 py-2 md:bg-gray-700 bg-slate-900 text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
        errorMessage ? "border-red-500" : ""
      }`}
      placeholder={placeholder}
      required={required}
    />
    {errorMessage && (
      <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
    )}
  </div>
);

const Signup = () => {
  const { setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateFields = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    setIsLoading(true);

    const fieldErrors = validateFields();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("username", formData.username);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);

    const profilePicture = document.getElementById("profilePicture").files[0];

    if (profilePicture && !profilePicture.type.startsWith("image/")) {
      setGeneralError("Profile picture must be an image file.");
      setIsLoading(false);
      return;
    }

    if (profilePicture) {
      formDataToSend.append("profilePicture", profilePicture);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/register`,
        {
          method: "POST",
          body: formDataToSend,
          credentials: "include",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setGeneralError(
          data.message || "Failed to register. Please try again."
        );
        setIsLoading(false);
        return;
      }

      setUser(data.data.user);
      window.location.href = "/friends";
    } catch (error) {
      setGeneralError("Failed to register. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isMobile
          ? "bg-black" // Solid black background for mobile
          : "bg-gradient-to-b from-black to-gray-900" // Gradient for desktop view
      }`}
    >
      <div
        className={`${
          isMobile
            ? "bg-transparent" // Transparent background for mobile to blend into the black background
            : "bg-gray-800" // Dark background for desktop
        } p-8 rounded-lg w-full max-w-md shadow-lg`}
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Create an Account
        </h2>

        {/* General Error Alert */}
        {generalError && (
          <div className="bg-red-600 text-white text-sm p-3 rounded mb-4 flex justify-between items-center">
            <span>{generalError}</span>
            <button
              className="ml-2 text-lg font-bold"
              onClick={() => setGeneralError(null)}
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="username"
            label="Username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            errorMessage={errors.username}
          />
          <div>
            <label
              htmlFor="profilePicture"
              className="block text-sm font-medium text-white"
            >
              Profile Picture
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              className="mt-1 block w-full px-3 py-2 md:bg-gray-700 bg-slate-900 text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <InputField
            id="name"
            label="Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            errorMessage={errors.name}
          />
          <InputField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            errorMessage={errors.email}
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            errorMessage={errors.password}
          />
          <InputField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            errorMessage={errors.confirmPassword}
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg hover:scale-105 hover:ring-2 hover:ring-blue-500 transition-transform duration-300 shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Signing Up...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-green-400 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
