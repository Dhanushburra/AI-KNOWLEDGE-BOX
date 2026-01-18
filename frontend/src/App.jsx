// import { useState, useEffect } from "react";

// export default function App() {
//   const [content, setContent] = useState("");
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [sources, setSources] = useState([]);
//   const [items, setItems] = useState([]);

//   // Helper function to detect if content is a URL
//   const isUrl = (text) => {
//     try {
//       const url = new URL(text.trim());
//       return url.protocol === "http:" || url.protocol === "https:";
//     } catch {
//       return false;
//     }
//   };

//   // Fetch all saved items
//   const fetchItems = async () => {
//     try {
//       const res = await fetch("http://localhost:8000/items");
//       const data = await res.json();
//       // Backend returns tuples: [id, type, content]
//       setItems(data.map(item => ({
//         id: item[0],
//         type: item[1],
//         content: item[2]
//       })));
//     } catch (error) {
//       console.error("Error fetching items:", error);
//     }
//   };

//   // Load items on mount
//   useEffect(() => {
//     fetchItems();
//   }, []);

//   const ingest = async () => {
//     const trimmedContent = content.trim();
//     const type = isUrl(trimmedContent) ? "url" : "note";
    
//     await fetch("http://localhost:8000/ingest", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ type, content: trimmedContent })
//     });
//     setContent("");
//     // Refresh items list after saving
//     fetchItems();
//   };

//   const ask = async () => {
//     const res = await fetch("http://localhost:8000/query", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ question })
//     });
//     const data = await res.json();
//     setAnswer(data.answer);
//     setSources(data.sources);
//   };

//   // Helper to get content preview
//   const getContentPreview = (content, maxLength = 100) => {
//     if (content.length <= maxLength) return content;
//     return content.substring(0, maxLength) + "...";
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Add Note or URL</h2>
//       <textarea 
//         value={content} 
//         onChange={e => setContent(e.target.value)} 
//         placeholder="Enter text note or paste a URL"
//         rows={3}
//         style={{ width: "100%", maxWidth: "600px" }}
//       />
//       <br />
//       <button onClick={ingest}>Save</button>
//       {content.trim() && (
//         <span style={{ marginLeft: 10 }}>
//           {isUrl(content.trim()) ? "🔗 URL detected" : "📝 Note"}
//         </span>
//       )}

//       <h2>Saved Items ({items.length})</h2>
//       {items.length === 0 ? (
//         <p style={{ color: "#666" }}>No items saved yet.</p>
//       ) : (
//         <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px" }}>
//           {items.map((item) => (
//             <div 
//               key={item.id}
//               style={{
//                 border: "1px solid #ddd",
//                 borderRadius: "5px",
//                 padding: "12px",
//                 backgroundColor: "#f9f9f9"
//               }}
//             >
//               <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
//                 <span style={{ 
//                   fontWeight: "bold",
//                   color: item.type === "url" ? "#0066cc" : "#333"
//                 }}>
//                   {item.type === "url" ? "🔗 URL" : "📝 Note"}
//                 </span>
//                 <span style={{ fontSize: "0.9em", color: "#666" }}>ID: {item.id}</span>
//               </div>
//               <div style={{ 
//                 color: "#444",
//                 wordBreak: "break-word",
//                 whiteSpace: "pre-wrap"
//               }}>
//                 {getContentPreview(item.content, 200)}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <h2>Ask Question</h2>
//       <input 
//         value={question} 
//         onChange={e => setQuestion(e.target.value)} 
//         placeholder="Enter your question"
//         style={{ width: "100%", maxWidth: "600px", padding: "8px" }}
//       />
//       <button onClick={ask} style={{ marginLeft: "10px" }}>Ask</button>

//       {answer && (
//         <>
//           <h3>Answer</h3>
//           <p style={{ 
//             backgroundColor: "#f0f0f0", 
//             padding: "15px", 
//             borderRadius: "5px",
//             whiteSpace: "pre-wrap"
//           }}>
//             {answer}
//           </p>
//         </>
//       )}

//       {sources.length > 0 && (
//         <>
//           <h4>Sources</h4>
//           <ul>
//             {sources.map((s, i) => (
//               <li key={i} style={{ marginBottom: "5px" }}>{s.text}</li>
//             ))}
//           </ul>
//         </>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from "react";

export default function App() {
  const [content, setContent] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [items, setItems] = useState([]);

  // Helper function to detect if content is a URL
  const isUrl = (text) => {
    try {
      const url = new URL(text.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Format timestamp to human-readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      // For older items, show date
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  // Fetch all saved items
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:8000/items");
      const data = await res.json();
      // Backend returns tuples: [id, type, content, created_at]
      setItems(data.map(item => ({
        id: item[0],
        type: item[1],
        content: item[2],
        timestamp: item[3] || null
      })));
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const ingest = async () => {
    const trimmedContent = content.trim();
    const type = isUrl(trimmedContent) ? "url" : "note";
    
    await fetch("http://localhost:8000/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content: trimmedContent })
    });
    setContent("");
    // Refresh items list after saving
    fetchItems();
  };

  const ask = async () => {
    const res = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    setAnswer(data.answer);
    setSources(data.sources);
  };

  // Helper to get content preview
  const getContentPreview = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Note or URL</h2>
      <textarea 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        placeholder="Enter text note or paste a URL"
        rows={3}
        style={{ width: "100%", maxWidth: "600px" }}
      />
      <br />
      <button onClick={ingest}>Save</button>
      {content.trim() && (
        <span style={{ marginLeft: 10 }}>
          {isUrl(content.trim()) ? "🔗 URL detected" : "📝 Note"}
        </span>
      )}

      <h2>Saved Items ({items.length})</h2>
      {items.length === 0 ? (
        <p style={{ color: "#666" }}>No items saved yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px" }}>
          {items.map((item) => (
            <div 
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "12px",
                backgroundColor: "#f9f9f9"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                <span style={{ 
                  fontWeight: "bold",
                  color: item.type === "url" ? "#0066cc" : "#333"
                }}>
                  {item.type === "url" ? "🔗 URL" : "📝 Note"}
                </span>
                <span style={{ fontSize: "0.9em", color: "#666" }}>ID: {item.id}</span>
                <span style={{ 
                  fontSize: "0.85em", 
                  color: "#888",
                  marginLeft: "auto"
                }}>
                  🕒 {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <div style={{ 
                color: "#444",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap"
              }}>
                {getContentPreview(item.content, 200)}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>Ask Question</h2>
      <input 
        value={question} 
        onChange={e => setQuestion(e.target.value)} 
        placeholder="Enter your question"
        style={{ width: "100%", maxWidth: "600px", padding: "8px" }}
      />
      <button onClick={ask} style={{ marginLeft: "10px" }}>Ask</button>

      {answer && (
        <>
          <h3>Answer</h3>
          <p style={{ 
            backgroundColor: "#f0f0f0", 
            padding: "15px", 
            borderRadius: "5px",
            whiteSpace: "pre-wrap"
          }}>
            {answer}
          </p>
        </>
      )}

      {sources.length > 0 && (
        <>
          <h4>Sources</h4>
          <ul>
            {sources.map((s, i) => (
              <li key={i} style={{ marginBottom: "5px" }}>{s.text}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}