require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Backend API is running and ready",
  });
});

// Endpoint health
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "success",
      message: "Backend is running",
      database: "connected",
      student: {
        name: "Muhammad Habib",
        nim: "2411522024",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Backend is running, but database is not connected",
      database: "disconnected",
      student: {
        name: "Muhammad Habib",
        nim: "2411522024",
      },
    });
  }
});

app.get("/schema", (req, res) => {
  res.json({
    student: {
      name: "Muhammad Habib",
      nim: "2411522024",
    },
    resource: {
      name: "vehicles",
      label: "Data Kendaraan",
      description: "Aplikasi untuk mengelola data kendaraan",
    },

    fields: [
      {
        name: "merk",
        label: "Merk Kendaraan",
        type: "text",
        required: true,
        showInTable: true,
      },
      {
        name: "model",
        label: "Model",
        type: "text",
        required: true,
        showInTable: true,
      },
      {
        name: "tahun_produksi",
        label: "Tahun Produksi",
        type: "number",
        required: false,
        showInTable: true,
      },
      {
        name: "warna",
        label: "Warna",
        type: "text",
        required: false,
        showInTable: true,
      },
      {
        name: "harga",
        label: "Harga (Rp)",
        type: "number",
        required: true,
        showInTable: true,
      },
    ],

    endpoints: {
      list: "/vehicles",
      detail: "/vehicles/{id}",
      create: "/vehicles",
      update: "/vehicles/{id}",
      delete: "/vehicles/{id}",
    },
  });
});

// Endpoint READ: Mengambil semua data kendaraan
app.get("/vehicles", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vehicles");

    res.json({
      status: "success",
      message: "Data retrieved successfully",
      items: rows,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data kendaraan",
      error: error.message,
    });
  }
});

// Endpoint CREATE: Tambah data kendaraan baru
app.post("/vehicles", async (req, res) => {
  try {
    const { merk, model, tahun_produksi, warna, harga } = req.body;
    const query =
      "INSERT INTO vehicles (merk, model, tahun_produksi, warna, harga) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.query(query, [
      merk,
      model,
      tahun_produksi,
      warna,
      harga,
    ]);

    res.json({
      status: "success",
      message: "Data created successfully",
      data: { id: result.insertId, merk, model, tahun_produksi, warna, harga },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menambah data",
      error: error.message,
    });
  }
});

// Endpoint READ DETAIL: Mengambil satu data kendaraan berdasarkan ID
app.get("/vehicles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Data tidak ditemukan" });
    }
    res.json({
      status: "success",
      message: "Data retrieved successfully",
      items: rows[0],
      data: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data",
      error: error.message,
    });
  }
});

// Endpoint UPDATE: Mengubah data kendaraan berdasarkan ID
app.put("/vehicles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { merk, model, tahun_produksi, warna, harga } = req.body;

    const query =
      "UPDATE vehicles SET merk=?, model=?, tahun_produksi=?, warna=?, harga=? WHERE id=?";
    const [result] = await pool.query(query, [
      merk,
      model,
      tahun_produksi,
      warna,
      harga,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Data tidak ditemukan untuk diubah",
      });
    }
    res.json({
      status: "success",
      message: "Data updated successfully",
      data: { id: parseInt(id), merk, model, tahun_produksi, warna, harga },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengubah data",
      error: error.message,
    });
  }
});

// Endpoint DELETE: Menghapus data kendaraan berdasarkan ID
app.delete("/vehicles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM vehicles WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Data tidak ditemukan untuk dihapus",
      });
    }
    res.json({ status: "success", message: "Data deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus data",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server Backend berjalan di http://localhost:${port}`);
});
