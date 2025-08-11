"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiSearch } from "react-icons/ci";
import {
  FiMenu,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiAlertTriangle,
  FiPackage,
  FiShoppingCart,
  FiTrendingDown,
  FiUsers,
  FiUser,
  FiBarChart2,
  FiSettings,
  FiDollarSign,
  FiClipboard,
  FiTruck,
  FiBell,
  FiLogOut,
  FiEye,
  FiChevronDown,
} from "react-icons/fi";
import { FaFacebook, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import { db } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      sku: "",
      brand: "",
      category: "",
      quantity: "",
      unit: "",
      minThreshold: "",
      unitCost: "",
      supplier: "",
    },
  });
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: editReset,
    formState: { errors: editErrors },
    setValue: setEditValue,
  } = useForm({
    defaultValues: {
      name: "",
      sku: "",
      brand: "",
      category: "",
      quantity: "",
      unit: "",
      minThreshold: "",
      unitCost: "",
      supplier: "",
    },
  });
  const {
    control: purchaseControl,
    handleSubmit: handlePurchaseSubmit,
    reset: purchaseReset,
    formState: { errors: purchaseErrors },
  } = useForm({
    defaultValues: {
      operationType: "add",
      quantityChange: "",
      reason: "",
    },
  });

  const GOLD = "#FFCC66";
  const ERROR_RED = "#ef4444";

  // Consolidated Material-UI styles
  const muiStyles = {
    input: {
      "& .MuiInputBase-input": { color: "white" },
      "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.7)" },
      "& .MuiFormLabel-root.Mui-focused": { color: GOLD },
      "& .MuiOutlinedInput-root fieldset": {
        borderColor: "rgba(255,255,255,0.2)",
      },
      "& .MuiOutlinedInput-root:hover fieldset": { borderColor: GOLD },
      "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: GOLD },
      "& .MuiFormLabel-root.Mui-error": { color: ERROR_RED },
      "& .MuiOutlinedInput-root.Mui-error fieldset": { borderColor: ERROR_RED },
      "& .MuiOutlinedInput-root.Mui-focused.Mui-error fieldset": {
        borderColor: ERROR_RED,
      },
      "& .MuiOutlinedInput-root.Mui-error:hover fieldset": {
        borderColor: ERROR_RED,
      },
      "& .MuiFormHelperText-root": { color: ERROR_RED },
      "& .MuiInputBase-input:-webkit-autofill": {
        WebkitTextFillColor: "white",
        boxShadow: "0 0 0px 1000px rgba(0,0,0,0.25) inset",
        caretColor: "white",
        transition: "background-color 9999s ease-in-out 0s",
      },
    },
    select: {
      "& .MuiSelect-select": { color: "white" },
      "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.7)" },
    },
    dialog: {
      backgroundColor: "#1f2937",
      color: "white",
      border: "1px solid #374151",
    },
    dialogTitle: {
      color: "#FFCC66",
      borderBottom: "1px solid #374151",
    },
    dialogActions: {
      borderTop: "1px solid #374151",
      p: 3,
    },
    button: {
      background: "linear-gradient(to right, #FFCC66, #FF7E5F)",
      color: "white",
      "&:hover": { background: "linear-gradient(to right, #FFD700, #FF6B47)" },
      "&:disabled": {
        background: "rgba(255, 204, 102, 0.3)",
        color: "rgba(255, 255, 255, 0.5)",
      },
    },
  };

  // Navigation items configuration
  const sidebarItems = [
    { icon: FiPackage, label: "Inventory", active: true },
    { icon: FiUsers, label: "Employees" },
    { icon: FiBarChart2, label: "Analytics" },
    { icon: FiUser, label: "Customers" },
    { icon: FiClipboard, label: "Orders" },
    { icon: FiDollarSign, label: "Revenue" },
    { icon: FiTruck, label: "Suppliers" },
    { icon: FiBell, label: "Notifications" },
    { icon: FiSettings, label: "Settings" },
  ];

  // sample categories for inventory
  const categories = [
    "Cleaning Chemicals",
    "Polishing Tools",
    "Interior Detailing Supplies",
    "Exterior Detailing Supplies",
    "Microfiber Products",
    "Ceramic Coatings",
    "Tire & Wheel Care",
    "Glass Care",
    "Other",
  ];

  // units of measurement
  const units = [
    "Liters",
    "Bottles",
    "Packs",
    "Pieces",
    "Gallons",
    "Ounces",
    "Kits",
  ];

  // Operation types for stock updates
  const operationTypes = [
    { value: "add", label: "Add Stock (Purchase/Restock)" },
    { value: "subtract", label: "Remove Stock (Used/Damaged)" },
  ];

  const inventoryCollection = collection(db, "inventory");

  // form field component for inventory items
  const FormField = ({
    name,
    control,
    rules,
    label,
    type = "text",
    options = null,
    errors,
    step,
    multiline,
    rows,
    className,
  }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) =>
        options ? (
          <FormControl fullWidth error={!!errors?.[name]} className={className}>
            <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
              {label}
            </InputLabel>
            <Select
              {...field}
              sx={{ ...muiStyles.input, ...muiStyles.select }}
              label={label}
            >
              {options.map((option) => (
                <MenuItem
                  key={typeof option === "string" ? option : option.value}
                  value={typeof option === "string" ? option : option.value}
                >
                  {typeof option === "string" ? option : option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            {...field}
            label={label}
            type={type}
            step={step}
            variant="outlined"
            fullWidth
            multiline={multiline}
            rows={rows}
            error={!!errors?.[name]}
            helperText={errors?.[name]?.message}
            sx={muiStyles.input}
            className={className}
          />
        )
      }
    />
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // fetch inventory data from firebase
  useEffect(() => {
    setLoading(true);

    const q = query(inventoryCollection, orderBy("lastUpdated", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const inventoryData = [];
        snapshot.forEach((doc) => {
          inventoryData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setInventory(inventoryData);

        // Check for low stock
        const lowStock = inventoryData.filter(
          (item) => item.quantity <= item.minThreshold
        );
        setLowStockAlerts(lowStock);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching inventory:", error);
        setSnackbar({
          open: true,
          message:
            "Error loading inventory data. Please check your Firestore rules.",
          severity: "error",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // search logic
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // add item
  const onAddSubmit = async (data) => {
    setActionLoading(true);
    try {
      const newItem = {
        ...data,
        quantity: parseInt(data.quantity),
        minThreshold: parseInt(data.minThreshold),
        unitCost: parseFloat(data.unitCost),
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      await addDoc(inventoryCollection, newItem);

      setSnackbar({
        open: true,
        message: "Item added successfully!",
        severity: "success",
      });

      handleCloseAddModal();
    } catch (error) {
      console.error("Error adding item:", error);
      setSnackbar({
        open: true,
        message: "Error adding item. Please try again.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // edit item
  const handleEdit = (item) => {
    setSelectedItem(item);
    Object.keys(item).forEach((key) => {
      setEditValue(key, item[key]);
    });
    setShowEditModal(true);
  };

  const onEditSubmit = async (data) => {
    setActionLoading(true);
    try {
      const updatedItem = {
        ...data,
        quantity: parseInt(data.quantity),
        minThreshold: parseInt(data.minThreshold),
        unitCost: parseFloat(data.unitCost),
        lastUpdated: serverTimestamp(),
      };

      const itemRef = doc(db, "inventory", selectedItem.id);
      await updateDoc(itemRef, updatedItem);

      setSnackbar({
        open: true,
        message: "Item updated successfully!",
        severity: "success",
      });

      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating item:", error);
      setSnackbar({
        open: true,
        message: "Error updating item. Please try again.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // delete item
  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setActionLoading(true);
      try {
        const itemRef = doc(db, "inventory", itemId);
        await deleteDoc(itemRef);

        setSnackbar({
          open: true,
          message: "Item deleted successfully!",
          severity: "success",
        });
      } catch (error) {
        console.error("Error deleting item:", error);
        setSnackbar({
          open: true,
          message: "Error deleting item. Please try again.",
          severity: "error",
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // stock update
  const handlePurchase = (item) => {
    setSelectedItem(item);
    purchaseReset({
      operationType: "add",
      quantityChange: "",
      reason: "",
    });
    setShowPurchaseModal(true);
  };

  const onPurchaseSubmit = async (data) => {
    setActionLoading(true);
    try {
      const quantityChange = parseInt(data.quantityChange);
      const currentItem = inventory.find((item) => item.id === selectedItem.id);

      if (!currentItem) {
        throw new Error("Item not found");
      }

      const newQuantity =
        data.operationType === "add"
          ? currentItem.quantity + quantityChange
          : currentItem.quantity - quantityChange;

      const updatedItem = {
        quantity: Math.max(0, newQuantity),
        lastUpdated: serverTimestamp(),
      };

      const itemRef = doc(db, "inventory", selectedItem.id);
      await updateDoc(itemRef, updatedItem);

      setSnackbar({
        open: true,
        message: `Stock ${data.operationType === "add" ? "added" : "removed"} successfully!`,
        severity: "success",
      });

      handleClosePurchaseModal();
    } catch (error) {
      console.error("Error updating stock:", error);
      setSnackbar({
        open: true,
        message: "Error updating stock. Please try again.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // function to close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseAddModal = () => {
    reset();
    setShowAddModal(false);
  };

  const handleCloseEditModal = () => {
    editReset();
    setSelectedItem(null);
    setShowEditModal(false);
  };

  const handleClosePurchaseModal = () => {
    purchaseReset();
    setSelectedItem(null);
    setShowPurchaseModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 relative z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/vynoxlogo.jpg"
                alt="Vynox Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
              <span className="ml-3 text-xl font-bold text-[#FFCC66]">
                Admin Dashboard
              </span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg border border-gray-700 text-white hover:border-[#FFCC66] transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#FFCC66] to-[#FF7E5F] rounded-full flex items-center justify-center">
                  <FiUser className="text-white text-sm" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  Owner
                </span>
                <FiChevronDown
                  className={`text-sm transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FiEye className="text-lg" />
                      <span>Customer View</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        // logout logic would be implemented here
                        console.log("Logout clicked");
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors w-full text-left"
                    >
                      <FiLogOut className="text-lg" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex-grow flex">
        {/* Sidebar */}
        <aside
          className={`hidden lg:block bg-gray-900 border-r border-gray-800 min-h-full transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div
            className={`${sidebarCollapsed ? "p-3" : "p-6"} transition-all duration-300`}
          >
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-6">
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold text-[#FFCC66]">
                  Dashboard
                </h2>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
              >
                <FiMenu className="text-lg" />
              </button>
            </div>

            <nav className="space-y-2">
              {/* Dashboard Navigation Items */}
              <div className="space-y-1">
                {sidebarItems.map((item, index) => (
                  <div
                    key={item.label}
                    className={`flex items-center ${
                      sidebarCollapsed ? "justify-center" : "gap-3"
                    } px-3 py-2 rounded-lg ${
                      item.active
                        ? "bg-[#FFCC66] bg-opacity-20 text-[#FFCC66] border border-[#FFCC66] border-opacity-30"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    } transition-all duration-200 cursor-pointer group relative`}
                  >
                    <item.icon
                      className={`text-lg flex-shrink-0 ${item.active ? "text-black" : ""}`}
                    />
                    {!sidebarCollapsed && (
                      <span
                        className={`font-medium ${item.active ? "text-black" : ""}`}
                      >
                        {item.label}
                      </span>
                    )}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#FFCC66] mb-2">
              Inventory Management
            </h1>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress sx={{ color: "#FFCC66" }} />
              <span className="ml-4 text-gray-400">Loading inventory...</span>
            </div>
          ) : (
            <>
              {/* Low Stock Alerts */}
              {lowStockAlerts.length > 0 && (
                <div className="mb-6">
                  <Alert
                    severity="warning"
                    icon={<FiAlertTriangle />}
                    sx={{
                      backgroundColor: "rgba(255, 152, 0, 0.1)",
                      border: "1px solid rgba(255, 152, 0, 0.2)",
                      color: "#ff9800",
                      "& .MuiAlert-icon": { color: "#ff9800" },
                    }}
                  >
                    <strong>Low Stock Alert:</strong> {lowStockAlerts.length}{" "}
                    item(s) need restocking
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lowStockAlerts.map((item) => (
                        <Chip
                          key={item.id}
                          label={`${item.name} (${item.quantity} ${item.unit})`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(255, 152, 0, 0.2)",
                            color: "#ff9800",
                            border: "1px solid rgba(255, 152, 0, 0.3)",
                          }}
                        />
                      ))}
                    </div>
                  </Alert>
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="text"
                      placeholder="Search by name, SKU, or brand..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#FFCC66] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="w-full md:w-64">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-[#FFCC66] focus:outline-none transition-colors"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add Item Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7E5F] text-white font-medium rounded-lg shadow-[0_0_10px_rgba(255,204,102,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,204,102,0.8)]"
                >
                  <FiPlus className="text-xl" />
                  Add Item
                </button>
              </div>

              {/* Inventory Table */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-[#FFCC66] font-semibold">
                          Item Details
                        </th>
                        <th className="px-6 py-4 text-left text-[#FFCC66] font-semibold">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-[#FFCC66] font-semibold">
                          Stock
                        </th>
                        <th className="px-6 py-4 text-left text-[#FFCC66] font-semibold">
                          Supplier
                        </th>
                        <th className="px-6 py-4 text-left text-[#FFCC66] font-semibold">
                          Cost
                        </th>
                        <th className="px-6 py-4 text-center text-[#FFCC66] font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-gray-700 hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <h3 className="font-semibold text-white">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-400">
                                SKU: {item.sku}
                              </p>
                              <p className="text-sm text-gray-400">
                                Brand: {item.brand}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span
                                className={`font-semibold ${item.quantity <= item.minThreshold ? "text-red-400" : "text-green-400"}`}
                              >
                                {item.quantity} {item.unit}
                              </span>
                              <p className="text-sm text-gray-400">
                                Min: {item.minThreshold}
                              </p>
                              {item.quantity <= item.minThreshold && (
                                <span className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                  <FiTrendingDown />
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300">
                              {item.supplier}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-green-400 font-semibold">
                              ${item.unitCost.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handlePurchase(item)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all"
                                title="Update Stock"
                              >
                                <FiShoppingCart className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-lg transition-all"
                                title="Edit Item"
                              >
                                <FiEdit3 className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                                title="Delete Item"
                              >
                                <FiTrash2 className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredInventory.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <FiPackage className="mx-auto text-6xl text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      No items found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {inventory.length === 0
                        ? "Get started by adding your first inventory item."
                        : "Try adjusting your search or add a new item to get started."}
                    </p>
                    {inventory.length === 0 && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7E5F] text-white font-medium rounded-lg shadow-[0_0_10px_rgba(255,204,102,0.6)] transition-all duration-300 hover:scale-105 mx-auto"
                      >
                        <FiPlus />
                        Add Your First Item
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Add Item Modal */}
      <Dialog
        open={showAddModal}
        onClose={handleCloseAddModal}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: muiStyles.dialog } }}
      >
        <DialogTitle sx={muiStyles.dialogTitle}>Add New Item</DialogTitle>
        <form onSubmit={handleSubmit(onAddSubmit)}>
          <DialogContent sx={{ pt: 3 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="name"
                control={control}
                rules={{ required: "Item name is required" }}
                label="Item Name"
                errors={errors}
              />
              <FormField
                name="sku"
                control={control}
                rules={{ required: "SKU is required" }}
                label="SKU"
                errors={errors}
              />
              <FormField
                name="brand"
                control={control}
                rules={{ required: "Brand is required" }}
                label="Brand"
                errors={errors}
              />
              <FormField
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                label="Category"
                options={categories}
                errors={errors}
              />
              <FormField
                name="quantity"
                control={control}
                rules={{
                  required: "Quantity is required",
                  min: { value: 0, message: "Quantity must be non-negative" },
                }}
                label="Quantity"
                type="number"
                errors={errors}
              />
              <FormField
                name="unit"
                control={control}
                rules={{ required: "Unit is required" }}
                label="Unit"
                options={units}
                errors={errors}
              />
              <FormField
                name="minThreshold"
                control={control}
                rules={{
                  required: "Minimum threshold is required",
                  min: { value: 1, message: "Threshold must be at least 1" },
                }}
                label="Minimum Threshold"
                type="number"
                errors={errors}
              />
              <FormField
                name="unitCost"
                control={control}
                rules={{
                  required: "Unit cost is required",
                  min: { value: 0, message: "Cost must be non-negative" },
                }}
                label="Unit Cost ($)"
                type="number"
                step="0.01"
                errors={errors}
              />
              <FormField
                name="supplier"
                control={control}
                rules={{ required: "Supplier is required" }}
                label="Supplier"
                errors={errors}
                className="md:col-span-2"
              />
            </div>
          </DialogContent>
          <DialogActions sx={muiStyles.dialogActions}>
            <Button onClick={handleCloseAddModal} sx={{ color: "#9ca3af" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={actionLoading}
              sx={muiStyles.button}
              startIcon={
                actionLoading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  <FiPlus />
                )
              }
            >
              {actionLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog
        open={showEditModal}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: muiStyles.dialog } }}
      >
        <DialogTitle sx={muiStyles.dialogTitle}>Edit Item</DialogTitle>
        <form onSubmit={handleEditSubmit(onEditSubmit)}>
          <DialogContent sx={{ pt: 3 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="name"
                control={editControl}
                rules={{ required: "Item name is required" }}
                label="Item Name"
                errors={editErrors}
              />
              <FormField
                name="sku"
                control={editControl}
                rules={{ required: "SKU is required" }}
                label="SKU"
                errors={editErrors}
              />
              <FormField
                name="brand"
                control={editControl}
                rules={{ required: "Brand is required" }}
                label="Brand"
                errors={editErrors}
              />
              <FormField
                name="category"
                control={editControl}
                rules={{ required: "Category is required" }}
                label="Category"
                options={categories}
                errors={editErrors}
              />
              <FormField
                name="quantity"
                control={editControl}
                rules={{
                  required: "Quantity is required",
                  min: { value: 0, message: "Quantity must be non-negative" },
                }}
                label="Quantity"
                type="number"
                errors={editErrors}
              />
              <FormField
                name="unit"
                control={editControl}
                rules={{ required: "Unit is required" }}
                label="Unit"
                options={units}
                errors={editErrors}
              />
              <FormField
                name="minThreshold"
                control={editControl}
                rules={{
                  required: "Minimum threshold is required",
                  min: { value: 1, message: "Threshold must be at least 1" },
                }}
                label="Minimum Threshold"
                type="number"
                errors={editErrors}
              />
              <FormField
                name="unitCost"
                control={editControl}
                rules={{
                  required: "Unit cost is required",
                  min: { value: 0, message: "Cost must be non-negative" },
                }}
                label="Unit Cost ($)"
                type="number"
                step="0.01"
                errors={editErrors}
              />
              <FormField
                name="supplier"
                control={editControl}
                rules={{ required: "Supplier is required" }}
                label="Supplier"
                errors={editErrors}
                className="md:col-span-2"
              />
            </div>
          </DialogContent>
          <DialogActions sx={muiStyles.dialogActions}>
            <Button onClick={handleCloseEditModal} sx={{ color: "#9ca3af" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={actionLoading}
              sx={muiStyles.button}
              startIcon={
                actionLoading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  <FiEdit3 />
                )
              }
            >
              {actionLoading ? "Updating..." : "Update Item"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Purchase/Stock Update Modal */}
      <Dialog
        open={showPurchaseModal}
        onClose={handleClosePurchaseModal}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: muiStyles.dialog } }}
      >
        <DialogTitle sx={muiStyles.dialogTitle}>
          Update Stock - {selectedItem?.name}
        </DialogTitle>
        <form onSubmit={handlePurchaseSubmit(onPurchaseSubmit)}>
          <DialogContent sx={{ pt: 3 }}>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Current Stock</p>
                <p className="text-xl font-semibold text-white">
                  {selectedItem?.quantity} {selectedItem?.unit}
                </p>
              </div>
              <FormField
                name="operationType"
                control={purchaseControl}
                rules={{ required: "Operation type is required" }}
                label="Operation"
                options={operationTypes}
                errors={purchaseErrors}
              />
              <FormField
                name="quantityChange"
                control={purchaseControl}
                rules={{
                  required: "Quantity is required",
                  min: { value: 1, message: "Quantity must be at least 1" },
                }}
                label="Quantity"
                type="number"
                errors={purchaseErrors}
              />
              <FormField
                name="reason"
                control={purchaseControl}
                label="Reason (Optional)"
                multiline
                rows={3}
                errors={purchaseErrors}
              />
            </div>
          </DialogContent>
          <DialogActions sx={muiStyles.dialogActions}>
            <Button
              onClick={handleClosePurchaseModal}
              sx={{ color: "#9ca3af" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={actionLoading}
              sx={muiStyles.button}
              startIcon={
                actionLoading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  <FiShoppingCart />
                )
              }
            >
              {actionLoading ? "Updating..." : "Update Stock"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and Description */}
            <div className="flex flex-col items-center md:items-start">
              <Image
                src="/vynoxlogo.jpg"
                alt="Vynox Logo"
                width={60}
                height={60}
                className="rounded-full mb-4"
              />
              <h3 className="text-[#FFCC66] font-bold text-lg mb-2">
                Vynox Auto Detailing
              </h3>
              <p className="text-gray-400 text-sm text-center md:text-left">
                Invnetory Management System
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-2 text-sm">
              <h4 className="text-[#FFCC66] font-semibold mb-2">
                Contact Info
              </h4>
              <p>📞 +1-587-438-7822</p>
              <Link
                href="mailto:mohamadalhajj2002@gmail.com"
                className="hover:text-[#FFCC66] transition-all hover:underline underline-offset-4"
              >
                📧 mohamadalhajj2002@gmail.com
              </Link>
              <Link
                href="https://maps.app.goo.gl/fPGxCvfNLQTd28wRA"
                target="_blank"
                className="hover:text-[#FFCC66] transition-all hover:underline underline-offset-4"
              >
                📍 2806 Ogden Rd SE, Calgary, AB
              </Link>
              <p>🕛 Mon–Fri: 9am–6pm</p>
            </div>

            {/* Social Links */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[#FFCC66] font-semibold mb-2">Follow Us</h4>
              <div className="flex gap-4 text-lg">
                <a href="#" className="hover:text-[#FFCC66] transition-colors">
                  <FaFacebook size={24} />
                </a>
                <a href="#" className="hover:text-[#FFCC66] transition-colors">
                  <FaInstagram size={24} />
                </a>
                <a href="#" className="hover:text-[#FFCC66] transition-colors">
                  <FaLinkedinIn size={24} />
                </a>
              </div>
            </div>
          </div>

          <hr className="border-gray-500 my-4" />
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Vynox Auto Detailing. All rights
            reserved.
          </p>
        </div>
      </footer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
