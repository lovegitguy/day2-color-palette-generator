import { useState, useEffect } from "react";

function App() {
  const [palette, setPalette] = useState([]);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [paletteName, setPaletteName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchSavedPalettes();
    generatePalette();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const fetchSavedPalettes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/palettes");

      if (!response.ok) throw new Error("Failed to load palettes");

      const data = await response.json();
      setSavedPalettes(data?.data || []);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const generatePalette = () => {
    const colors = Array(5)
      .fill(0)
      .map(
        () =>
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")
      );
    setPalette(colors);
  };

  const savePalette = async () => {
    if (!paletteName.trim()) {
      return showToast("Enter palette name first");
    }

    try {
      await fetch("/api/palettes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colors: palette,
          name: paletteName.trim(),
        }),
      });

      setPaletteName("");
      fetchSavedPalettes();
      showToast("Palette saved 🎉");
    } catch {
      showToast("Failed to save palette");
    }
  };

  const deletePalette = async (id) => {
    try {
      await fetch(`/api/palettes/${id}`, { method: "DELETE" });
      fetchSavedPalettes();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
    showToast(`Copied ${color}`);
  };


  const downloadPalette = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 260;

    const ctx = canvas.getContext("2d");

    palette.forEach((c, i) => {
      const x = (900 / 5) * i;

      ctx.fillStyle = c;
      ctx.fillRect(x, 0, 900 / 5, 200);

      ctx.fillStyle = "white";
      ctx.font = "18px monospace";
      ctx.textAlign = "center";
      ctx.fillText(c.toUpperCase(), x + 90, 230);
    });

    const link = document.createElement("a");
    link.download = "palette.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#020617)",
        color: "white",
        padding: "30px",
      }}
    >
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: "#22c55e",
            padding: "10px 15px",
            borderRadius: "8px",
          }}
        >
          {toast}
        </div>
      )}

      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        🎨 Color Palette Generator
      </h1>

      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          background: "rgba(15,23,42,.7)",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,.4)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2>Current Palette</h2>

        <input
          value={paletteName}
          onChange={(e) => setPaletteName(e.target.value)}
          placeholder="Enter palette name"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#020617",
            color: "white",
            marginBottom: "15px",
          }}
        />

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          {palette.map((color, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div
                style={{
                  height: "140px",
                  borderRadius: "12px",
                  background: color,
                  cursor: "pointer",
                  border: "3px solid rgba(255,255,255,.1)",
                }}
                onClick={() => copyColor(color)}
              />
              <p
                style={{
                  textAlign: "center",
                  fontFamily: "monospace",
                  marginTop: "8px",
                }}
              >
                {color}
              </p>
            </div>
          ))}
        </div>

      
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={generatePalette}
            style={buttonStyle("#4f46e5")}
          >
            🔄 Generate
          </button>

          <button
            onClick={savePalette}
            style={buttonStyle("#22c55e")}
          >
            💾 Save
          </button>

          <button
            onClick={downloadPalette}
            style={buttonStyle("#0ea5e9")}
          >
            📥 Download
          </button>
        </div>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      {/* SAVED PALETTES */}
      {savedPalettes.length > 0 && (
        <div
          style={{
            maxWidth: "900px",
            margin: "40px auto",
          }}
        >
          <h2>Saved Palettes</h2>

          {savedPalettes.map((p) => (
            <div
              key={p.id}
              style={{
                marginBottom: "15px",
                padding: "15px",
                background: "rgba(255,255,255,.05)",
                borderRadius: "14px",
              }}
            >
              <strong>{p.name}</strong>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "10px",
                }}
              >
                {p.colors.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: "60px",
                      background: c,
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => copyColor(c)}
                  />
                ))}
              </div>

              <button
                onClick={() => deletePalette(p.id)}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#dc2626",
                  color: "white",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const buttonStyle = (bg) => ({
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  background: bg,
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
});

export default App;
