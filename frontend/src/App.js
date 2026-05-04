import { useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // 🔍 SEARCH
  const searchDocs = async () => {
    if (!query.trim()) {
      alert("Please enter something to search");
      return;
    }

    try {
      setLoading(true);
      const startTime = Date.now();

      const res = await fetch("http://localhost:5000/api/docs/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      const endTime = Date.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

      setResults(data.results);
      setSearchTime(timeTaken);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 💬 ASK QUESTION
  const askQuestion = async () => {
    if (!question.trim()) return;

    try {
      setChatLoading(true);

      const res = await fetch("http://localhost:5000/api/chat/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      console.log(err);
    } finally {
      setChatLoading(false);
    }
  };

  // 📂 UPLOAD
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch("http://localhost:5000/api/upload/upload", {
        method: "POST",
        body: formData,
      });

      alert("File uploaded and processed ✅");
      setResults([]);
      setQuery("");
    } catch (err) {
      console.log(err);
    }
  };

  // ✨ SNIPPET
  const getSnippet = (text, query) => {
    if (!query) return text.slice(0, 150) + "...";

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text.slice(0, 150) + "...";

    const start = Math.max(0, index - 60);
    const end = Math.min(text.length, index + 100);

    return "..." + text.slice(start, end) + "...";
  };

  // ✨ HIGHLIGHT
  const highlightText = (text, query) => {
    if (!query) return text;

    const words = query.split(" ").filter(w => w.trim() !== "");
    let highlighted = text;

    words.forEach(word => {
      const regex = new RegExp(`(${word})`, "gi");
      highlighted = highlighted.replace(
        regex,
        `<mark style="background:#ffe066;padding:2px;border-radius:3px;">$1</mark>`
      );
    });

    return highlighted;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        padding: "40px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "auto", padding: "30px" }}>

        {/* TITLE */}
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "600",
            color: "#fff",
          }}
        >
          🧠 AI Powered Document Search System
        </h2>

        {/* ABOUT BUTTON */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={() => setShowAbout(!showAbout)}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              borderRadius: "6px",
              border: "none",
              background: "#1f2937",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            {showAbout ? "Hide Info" : "ℹ About"}
          </button>
        </div>

        {/* ABOUT CONTENT */}
        {showAbout && (
          <div
            style={{
              marginBottom: "20px",
              padding: "16px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.1)",
              color: "#f1f5f9",
              fontSize: "14px",
              lineHeight: "1.6"
            }}
          >
            <b>🧠 AI Powered Document Search System</b>
            <br /><br />
            This project performs <b>semantic search</b> on documents using embeddings,
            allowing users to find relevant content based on meaning rather than keywords.
            <br /><br />
            It also includes a <b>Q&A system</b> that retrieves context and generates answers.
            <br /><br />
            <b>✨ Developed by Sumayya Riaz</b>
          </div>
        )}

        {/* SEARCH */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Ask anything about your documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "none",
            }}
          />

          <button
            onClick={searchDocs}
            style={{
              padding: "12px 20px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        {/* ASK */}
        <h3 style={{ color: "#fff" }}>💬 Ask your document</h3>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <input
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none" }}
          />

          <button
            onClick={askQuestion}
            style={{
              padding: "10px 16px",
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "8px"
            }}
          >
            Ask
          </button>
        </div>

        {/* ANSWER */}
        {answer && (
          <div
            style={{
              marginTop: "15px",
              padding: "18px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white",
            }}
          >
            🤖 Answer:
            <br /><br />
            {answer}
          </div>
        )}

        {/* LOADING */}
        {loading && <p style={{ textAlign: "center", color: "#cbd5f5" }}>🔍 Searching...</p>}

        {/* TIME */}
        {searchTime && !loading && (
          <p style={{ color: "#cbd5f5" }}>
            Found {results.length} results in {searchTime} sec
          </p>
        )}

        {/* NO RESULTS */}
       {!loading && searchTime && results.length === 0 && (
  <p style={{ textAlign: "center", color: "#cbd5f5" }}>
    ❌ No relevant results found
  </p>
)}

        {/* RESULTS */}
        {results.map((item, index) => (
          <div
            key={index}
            style={{
              marginBottom: "18px",
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            {index === 0 && (
              <span style={{ background: "#22c55e", padding: "4px 8px", borderRadius: "6px" }}>
                ⭐ Best Match
              </span>
            )}

            <p
              dangerouslySetInnerHTML={{
                __html: highlightText(getSnippet(item.text, query), query),
              }}
            />

            <p style={{ fontSize: "12px", color: "#cbd5f5" }}>
              📄 {item.fileName}
            </p>
          </div>
        ))}

        {/* UPLOAD */}
        <div style={{ marginTop: "40px" }}>
          <h3 style={{ color: "#fff" }}>Upload Document 📄</h3>

          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <button
            onClick={handleUpload}
            style={{
              marginLeft: "10px",
              padding: "8px 12px",
              background: "#764ba2",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Upload
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;