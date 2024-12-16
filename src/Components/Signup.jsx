import React, { useState, useContext, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
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
  <div data-aos="fade-up">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
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
    AOS.init({ duration: 1000 }); // Initialize AOS animation

    // Detect Mobile Device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

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

    try {
      // Example API call setup
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/register`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setGeneralError(data.message || "Registration failed");
        return;
      }

      setUser(data.data.user);
      window.location.href = "/friends";
    } catch (error) {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isMobile ? "bg-gray-800" : "bg-black"
      }`}
    >
      <div
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
        data-aos="zoom-in"
      >
        <h2
          className="text-2xl font-bold text-white text-center mb-6"
          data-aos="fade-down"
        >
          Create an Account
        </h2>

        {generalError && (
          <div
            className="bg-red-600 text-white text-sm p-3 rounded mb-4 flex justify-between items-center"
            data-aos="fade-up"
          >
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
            data-aos="fade-up"
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p
          className="mt-6 text-center text-gray-400 text-sm"
          data-aos="fade-up"
        >
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
