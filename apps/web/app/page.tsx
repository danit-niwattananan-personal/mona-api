"use client";

import { useState, useEffect } from "react";
import { generateApiKey, protectedHello, listApiKeys, deleteApiKey, ApiKeyData, getDescription, getTeam, getTeamSize, getImages } from "../lib/api";

export default function Page() {
  const [apiKey, setApiKey] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("apiKey") : null
  );
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [message, setMessage] = useState("");
  const [keyName, setKeyName] = useState("");
  const [newGeneratedKey, setNewGeneratedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "test" | "docs">("manage");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState<any>(null);
  const [teamSize, setTeamSize] = useState<number | null>(null);
  const [images, setImages] = useState<any>(null);

  useEffect(() => {
    if (apiKey) {
      loadApiKeys();
    }
  }, [apiKey]);

  async function loadApiKeys() {
    if (!apiKey) return;
    try {
      const keys = await listApiKeys(apiKey);
      setApiKeys(keys);
    } catch (error) {
      console.error("Failed to load API keys:", error);
    }
  }

  async function handleGenerateKey() {
    setLoading(true);
    setNewGeneratedKey(null);
    try {
      const result = await generateApiKey(keyName || undefined);
      setApiKey(result.apiKey);
      setNewGeneratedKey(result.apiKey);
      localStorage.setItem("apiKey", result.apiKey);
      setKeyName("");
      await loadApiKeys();
    } catch (error) {
      alert("Failed to generate API key");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteKey(keyId: string) {
    if (!apiKey || !confirm("Are you sure you want to delete this API key?")) return;
    
    setLoading(true);
    try {
      await deleteApiKey(apiKey, keyId);
      await loadApiKeys();
    } catch (error) {
      alert("Failed to delete API key");
    } finally {
      setLoading(false);
    }
  }

  async function handleCallAllEndpoints() {
    if (!apiKey) return;
    setLoading(true);
    
    // Reset all states
    setMessage("");
    setDescription("");
    setTeam(null);
    setTeamSize(null);
    setImages(null);
    
    try {
      // Call all endpoints in parallel
      const [helloResult, descResult, teamResult, sizeResult, imagesResult] = await Promise.all([
        protectedHello(apiKey).catch(() => ({ message: "Failed to call /hello" })),
        getDescription(apiKey).catch(() => ({ description: "Failed to get description" })),
        getTeam(apiKey).catch(() => ({ team: { error: "Failed to get team" } })),
        getTeamSize(apiKey).catch(() => ({ size: null })),
        getImages(apiKey).catch(() => ({ images: { error: "Failed to get images" } }))
      ]);
      
      setMessage(helloResult.message);
      setDescription(descResult.description);
      setTeam(teamResult.team);
      setTeamSize(sizeResult.size);
      setImages(imagesResult.images);
    } catch (error) {
      console.error("Error calling endpoints:", error);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🔐 MONA API
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Secure API Key Management System
              </p>
            </div>
            {apiKey && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Active Keys:</span> {apiKeys.length}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 inline-flex gap-1">
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === "manage"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            🔑 Manage Keys
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === "test"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            🧪 Test API
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === "docs"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            📚 Documentation
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "manage" && (
          <div className="space-y-6">
            {/* Generate API Key Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Generate New API Key
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Key name (optional)"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleGenerateKey}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate Key"}
                </button>
              </div>
              
              {newGeneratedKey && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
                    ✅ New API Key Generated! Save it now - you won't see it again.
                  </p>
                  <div className="flex gap-2 items-center">
                    <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded text-sm font-mono">
                      {newGeneratedKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newGeneratedKey)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* API Keys List */}
            {apiKey && apiKeys.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Your API Keys
                </h2>
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm bg-white dark:bg-gray-800 px-3 py-1 rounded border border-gray-300 dark:border-gray-600">
                            •••{key.preview}
                          </span>
                          {key.name && (
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {key.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Created: {new Date(key.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {apiKey && apiKeys.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No API keys yet. Generate one to get started!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "test" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Test Protected API Endpoints
            </h2>
            
            {!apiKey ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ Please generate an API key first to test the protected endpoints.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                    Current API Key:
                  </p>
                  <code className="text-xs font-mono text-blue-900 dark:text-blue-100 break-all">
                    {apiKey}
                  </code>
                </div>

                {/* Single button to call all endpoints */}
                <button
                  onClick={handleCallAllEndpoints}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Calling All Endpoints..." : "Call All API Endpoints"}
                </button>

                {/* Results section */}
                {(message || description || team || teamSize !== null || images) && (
                  <div className="space-y-4">
                    {/* /hello response */}
                    {message && (
                      <div className={`p-4 rounded-lg ${
                        message.includes("Failed") 
                          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      }`}>
                        <p className={`font-medium ${
                          message.includes("Failed")
                            ? "text-red-800 dark:text-red-200"
                            : "text-green-800 dark:text-green-200"
                        }`}>
                          GET /hello:
                        </p>
                        <p className={`mt-1 ${
                          message.includes("Failed")
                            ? "text-red-700 dark:text-red-300"
                            : "text-green-700 dark:text-green-300"
                        }`}>
                          {message}
                        </p>
                      </div>
                    )}

                    {/* /api/v1/description response */}
                    {description && (
                      <div className={`p-4 rounded-lg ${
                        description.includes("Failed") 
                          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      }`}>
                        <p className={`font-medium ${
                          description.includes("Failed")
                            ? "text-red-800 dark:text-red-200"
                            : "text-green-800 dark:text-green-200"
                        }`}>
                          GET /api/v1/description:
                        </p>
                        <p className={`mt-1 ${
                          description.includes("Failed")
                            ? "text-red-700 dark:text-red-300"
                            : "text-green-700 dark:text-green-300"
                        }`}>
                          {description}
                        </p>
                      </div>
                    )}

                    {/* /api/v1/team response */}
                    {team && (
                      <div className={`p-4 rounded-lg ${
                        team.error
                          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      }`}>
                        <p className={`font-medium ${
                          team.error
                            ? "text-red-800 dark:text-red-200"
                            : "text-green-800 dark:text-green-200"
                        }`}>
                          GET /api/v1/team:
                        </p>
                        {team.error ? (
                          <p className="mt-1 text-red-700 dark:text-red-300">{team.error}</p>
                        ) : (
                          <div className="mt-2">
                            <p className="text-green-700 dark:text-green-300">
                              <strong>Name:</strong> {team.name}
                            </p>
                            <p className="text-green-700 dark:text-green-300">
                              <strong>Members:</strong> {team.members.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* /api/v1/teamsize response */}
                    {teamSize !== null && (
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="font-medium text-green-800 dark:text-green-200">
                          GET /api/v1/teamsize:
                        </p>
                        <p className="mt-1 text-green-700 dark:text-green-300">
                          {teamSize} members
                        </p>
                      </div>
                    )}

                    {/* /api/v1/images response */}
                    {images && (
                      <div className={`p-4 rounded-lg ${
                        images.error
                          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      }`}>
                        <p className={`font-medium ${
                          images.error
                            ? "text-red-800 dark:text-red-200"
                            : "text-green-800 dark:text-green-200"
                        }`}>
                          GET /api/v1/images:
                        </p>
                        {images.error ? (
                          <p className="mt-1 text-red-700 dark:text-red-300">{images.error}</p>
                        ) : (
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(images).map(([name, imageData]: [string, any]) => (
                              <div key={name} className="flex flex-col items-center">
                                <img 
                                  src={imageData} 
                                  alt={name}
                                  className="w-24 h-24 rounded-full object-cover border-2 border-green-300 dark:border-green-700"
                                />
                                <p className="mt-2 text-sm font-medium text-green-800 dark:text-green-200">
                                  {name}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "docs" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                API Documentation
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Complete guide to using the MONA API with secure API key authentication.
              </p>

              {/* Base URL */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Base URL
                </h3>
                <code className="block px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                  http://localhost:8080
                </code>
              </div>

              {/* Authentication */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Authentication
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  All protected endpoints require an API key in the request header:
                </p>
                <code className="block px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                  x-api-key: YOUR_API_KEY
                </code>
              </div>

              {/* Endpoints */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Endpoints
              </h3>

              {/* Generate Key */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-bold rounded">
                    POST
                  </span>
                  <code className="text-sm font-mono">/generate-key</code>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Generate a new API key. This endpoint is public and doesn't require authentication.
                </p>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Request Body (optional):
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
  "name": "My API Key"  // Optional: friendly name for the key
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Response:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
  "apiKey": "xxxx-xxxx-xxxx",
  "id": "key-id-123",
  "preview": "0000",
  "createdAt": "2025-11-20T10:00:00.000Z",
  "name": "My API Key"
}`}
                  </pre>
                </div>
              </div>

              {/* List Keys */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono">/api-keys</code>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                    PROTECTED
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  List all API keys with metadata (excluding the actual key values).
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Response:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
  "keys": [
    {
      "id": "key-id-123",
      "preview": "0000",
      "createdAt": "2025-11-20T10:00:00.000Z",
      "name": "My API Key"
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              {/* Delete Key */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-bold rounded">
                    DELETE
                  </span>
                  <code className="text-sm font-mono">/api-keys/:id</code>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                    PROTECTED
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Delete a specific API key by its ID.
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Response:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
  "message": "API key deleted successfully"
}`}
                  </pre>
                </div>
              </div>

              {/* Hello Endpoint */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono">/hello</code>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                    PROTECTED
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  A sample protected endpoint for testing API key authentication.
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Response:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
  "message": "Hello from the hashed in-memory API!"
}`}
                  </pre>
                </div>
              </div>

              {/* Description Endpoint */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono">/api/v1/description</code>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                    PROTECTED
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Returns a textual description of the team.
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Response:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
  "description": "We are top tier team with coding experience of 1 million years in the bag 🚀"
}`}
                  </pre>
                </div>
              </div>

              {/* Team Endpoint */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono">/api/v1/team</code>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                    PROTECTED
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Returns team information including name and members.
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Response:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
  "team": {
    "name": "MONA",
    "members": ["Andriani", "Danit", "Jan", "Hana"]
  }
}`}
                  </pre>
                </div>
              </div>

              {/* Team Size Endpoint */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono">/api/v1/teamsize</code>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                    PROTECTED
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Returns the number of team members.
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Response:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
  "size": 4
}`}
                  </pre>
                </div>
              </div>

              {/* Images Endpoint */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono">/api/v1/images</code>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                    PROTECTED
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Returns team member images as base64-encoded data.
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Response:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
  "images": {
    "Andriani": "data:image/png;base64,...",
    "Danit": "data:image/jpg;base64,...",
    "Jan": "data:image/jpg;base64,...",
    "Hana": "data:image/jpg;base64,..."
  }
}`}
                  </pre>
                </div>
              </div>

              {/* Example Usage */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Example Usage
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Generate a new API key:
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST http://localhost:8080/generate-key \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My API Key"}'`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Call a protected endpoint:
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`curl http://localhost:8080/hello \\
  -H "x-api-key: YOUR_API_KEY"`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      List all API keys:
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`curl http://localhost:8080/api-keys \\
  -H "x-api-key: YOUR_API_KEY"`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Delete an API key:
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X DELETE http://localhost:8080/api-keys/KEY_ID \\
  -H "x-api-key: YOUR_API_KEY"`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Get team description:
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`curl http://localhost:8080/api/v1/description \\
  -H "x-api-key: YOUR_API_KEY"`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Get team information:
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`curl http://localhost:8080/api/v1/team \\
  -H "x-api-key: YOUR_API_KEY"`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Get team size:
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`curl http://localhost:8080/api/v1/teamsize \\
  -H "x-api-key: YOUR_API_KEY"`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Get team member images:
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`curl http://localhost:8080/api/v1/images \\
  -H "x-api-key: YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Security Notes */}
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                  🔒 Security Notes
                </h3>
                <ul className="list-disc list-inside text-yellow-800 dark:text-yellow-300 space-y-1 text-sm">
                  <li>API keys are hashed using bcrypt before storage</li>
                  <li>Only the hash is stored in memory - never the plaintext key</li>
                  <li>Save your API key immediately after generation - it cannot be retrieved later</li>
                  <li>Keys are stored in memory and will be lost on server restart</li>
                  <li>All protected endpoints require valid authentication</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>MONA API - Secure API Key Management © 2025</p>
      </footer>
    </div>
  );
}

