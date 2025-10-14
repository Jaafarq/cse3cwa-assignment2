export default function AboutPage() {
    return (
      <section aria-labelledby="h1">
        <h1 id="h1">About</h1>
        <p>Hello! I am <strong>Jaafar Qassin</strong>, student number <strong>22210175</strong>.</p>
        <p>This short video explains how to use the site:</p>
  
        <div className="card" role="region" aria-label="How to use video">
          <video
            src="/About.mp4"
            controls
            preload="metadata"
            style={{ width: "100%", height: "auto", borderRadius: 12 }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </section>
    );
  }
  