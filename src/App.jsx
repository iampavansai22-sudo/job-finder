
import { useEffect, useMemo, useState } from "react";
import { jobs } from "./job";

const formatSalary = (salary) =>
  `₹${(salary / 100000).toFixed(1).replace(".0", "")} LPA`;

function readSavedJobs() {
  try {
    const saved = JSON.parse(localStorage.getItem("jobfinder-saved") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function App() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [jobType, setJobType] = useState("All types");
  const [experience, setExperience] = useState("All levels");
  const [sortBy, setSortBy] = useState("newest");
  const [savedJobs, setSavedJobs] = useState(readSavedJobs);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("jobfinder-saved", JSON.stringify(savedJobs));
  }, [savedJobs]);

  function toggleSaved(id) {
    setSavedJobs((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id]
    );
  }

  function clearFilters() {
    setSearch("");
    setLocation("All locations");
    setJobType("All types");
    setExperience("All levels");
    setSortBy("newest");
    setShowSavedOnly(false);
  }

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.company,
        job.location,
        ...job.skills,
      ].join(" ").toLowerCase();

      const matchesSearch = searchableText.includes(query);
      const matchesLocation =
        location === "All locations" || job.location === location;
      const matchesType =
        jobType === "All types" || job.type === jobType;
      const matchesExperience =
        experience === "All levels" || job.experience === experience;
      const matchesSaved =
        !showSavedOnly || savedJobs.includes(job.id);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesExperience &&
        matchesSaved
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "salary-high") return b.salary - a.salary;
      if (sortBy === "salary-low") return a.salary - b.salary;
      return a.posted - b.posted;
    });
  }, [
    search,
    location,
    jobType,
    experience,
    sortBy,
    showSavedOnly,
    savedJobs,
  ]);

  const activeFilters = [
    location !== "All locations",
    jobType !== "All types",
    experience !== "All levels",
    showSavedOnly,
  ].filter(Boolean).length;

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="JobFinder home">
          <span className="brand-mark">J</span>
          <span>Job<span className="brand-accent">Finder</span></span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a className="nav-active" href="#jobs">Find jobs</a>
          <a href="#career-tips">Career tips</a>
        </nav>

        <div className="nav-actions">
          <button
            className={`saved-nav ${showSavedOnly ? "selected" : ""}`}
            onClick={() => {
              setShowSavedOnly((current) => !current);
              document.getElementById("jobs")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            ♡ Saved ({savedJobs.length})
          </button>
          <a className="nav-cta" href="#jobs">Explore jobs ↗</a>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE
            </span>
            <h1>
              Find a job that
              <br />
              <span>moves you forward.</span>
            </h1>
            <p>
              Discover opportunities that match your skills, goals, and
              ambitions. Your next opportunity is closer than you think.
            </p>

            <form
              className="hero-search"
              onSubmit={(event) => {
                event.preventDefault();
                document.getElementById("jobs")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <span className="search-icon">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Job title, company, or skill"
                aria-label="Search job title, company, or skill"
              />
              <button type="submit">Search jobs</button>
            </form>

            <div className="hero-note">
              <span>✓</span> Internships and entry-level jobs included
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-circle circle-one" />
            <div className="art-circle circle-two" />
            <div className="art-card floating-card">
              <div className="art-card-icon">↗</div>
              <div>
                <strong>Your next role</strong>
                <span>is out there.</span>
              </div>
            </div>
            <div className="art-person">
              <div className="person-head" />
              <div className="person-body" />
            </div>
            <div className="art-pill">New opportunities ✦</div>
          </div>
        </section>

        <section className="benefits">
          <div><span className="benefit-icon">⌕</span><div><strong>Discover roles</strong><p>Find opportunities for your skills</p></div></div>
          <div><span className="benefit-icon">♡</span><div><strong>Save your favorites</strong><p>Keep track of interesting jobs</p></div></div>
          <div><span className="benefit-icon">↗</span><div><strong>Take the next step</strong><p>Explore your career possibilities</p></div></div>
        </section>

        <section className="jobs-section" id="jobs">
          <div className="section-heading">
            <div>
              <span className="section-kicker">OPPORTUNITIES FOR YOU</span>
              <h2>{showSavedOnly ? "Your saved jobs" : "Explore open positions"}</h2>
              <p>Find the role that fits your next career move.</p>
            </div>
            <span className="result-count">
              {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
            </span>
          </div>

          <div className="jobs-layout">
            <aside className={`filters ${mobileFiltersOpen ? "filters-open" : ""}`}>
              <div className="filter-heading">
                <h3>Filters {activeFilters > 0 && <span>{activeFilters}</span>}</h3>
                <button onClick={clearFilters}>Clear all</button>
              </div>

              <label className="filter-label" htmlFor="location">Location</label>
              <select id="location" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option>All locations</option>
                <option>Bengaluru</option>
                <option>Hyderabad</option>
                <option>Chennai</option>
                <option>Pune</option>
                <option>Remote</option>
              </select>

              <label className="filter-label" htmlFor="jobType">Job type</label>
              <select id="jobType" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option>All types</option>
                <option>Full-time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>

              <label className="filter-label" htmlFor="experience">Experience</label>
              <select id="experience" value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option>All levels</option>
                <option>Fresher</option>
                <option>Entry level</option>
                <option>Mid level</option>
              </select>

              <label className="filter-label" htmlFor="sort">Sort by</label>
              <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="salary-high">Highest salary</option>
                <option value="salary-low">Lowest salary</option>
              </select>

              <label className="saved-filter">
                <input
                  type="checkbox"
                  checked={showSavedOnly}
                  onChange={(e) => setShowSavedOnly(e.target.checked)}
                />
                Show saved jobs only
              </label>

              <div className="filter-tip">
                <span>✦</span>
                <strong>Career tip</strong>
                <p>Highlight your React projects and GitHub profile when applying for frontend roles.</p>
              </div>
            </aside>

            <div className="job-results">
              <div className="results-toolbar">
                <span>Showing <strong>{filteredJobs.length}</strong> opportunities</span>
                <button
                  className="mobile-filter-button"
                  onClick={() => setMobileFiltersOpen((current) => !current)}
                >
                  {mobileFiltersOpen ? "Hide filters" : "☷ Filters"}
                </button>
              </div>

              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <article className="job-card" key={job.id}>
                    <div className={`company-logo ${job.color}`}>
                      {job.logo}
                    </div>

                    <div className="job-main">
                      <button
                        className="job-title"
                        onClick={() => setSelectedJob(job)}
                      >
                        {job.title}
                      </button>
                      <div className="company-name">{job.company}</div>

                      <div className="job-meta">
                        <span>⌖ {job.location}</span>
                        <span>◷ {job.type}</span>
                        <span>₹ {formatSalary(job.salary)}</span>
                      </div>

                      <div className="job-tags">
                        {job.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="job-actions">
                      <button
                        className={`bookmark ${savedJobs.includes(job.id) ? "bookmarked" : ""}`}
                        onClick={() => toggleSaved(job.id)}
                        aria-label={`${savedJobs.includes(job.id) ? "Unsave" : "Save"} ${job.title}`}
                        title="Save job"
                      >
                        {savedJobs.includes(job.id) ? "♥" : "♡"}
                      </button>
                      <button
                        className="details-button"
                        onClick={() => setSelectedJob(job)}
                      >
                        View details ↗
                      </button>
                      <span className="posted-time">
                        {job.posted === 1 ? "1 day ago" : `${job.posted} days ago`}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-results">
                  <span>⌕</span>
                  <h3>No jobs found</h3>
                  <p>Try changing your search or clearing some filters.</p>
                  <button className="clear-button" onClick={clearFilters}>
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="career-banner" id="career-tips">
          <div>
            <span className="section-kicker">YOUR CAREER TOOLKIT</span>
            <h2>Small steps. Big career moves.</h2>
            <p>Build projects, keep learning, and show employers what you can do.</p>
          </div>
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            Explore GitHub ↗
          </a>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">J</span>
          <span>Job<span className="brand-accent">Finder</span></span>
        </a>
        <p>Practice project built with React. Listings are sample data.</p>
        <span>© 2026 JobFinder</span>
      </footer>

      {selectedJob && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedJob(null);
          }}
        >
          <section
            className="job-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-job-title"
          >
            <button
              className="modal-close"
              onClick={() => setSelectedJob(null)}
              aria-label="Close job details"
            >
              ×
            </button>

            <div className={`company-logo modal-logo ${selectedJob.color}`}>
              {selectedJob.logo}
            </div>
            <span className="section-kicker">{selectedJob.company}</span>
            <h2 id="modal-job-title">{selectedJob.title}</h2>
            <div className="modal-meta">
              <span>{selectedJob.location}</span>
              <span>{selectedJob.type}</span>
              <span>{selectedJob.experience}</span>
            </div>

            <div className="modal-salary">{formatSalary(selectedJob.salary)} <span>per year</span></div>
            <h3>About the role</h3>
            <p>{selectedJob.description}</p>

            <h3>What you'll need</h3>
            <ul>
              {selectedJob.requirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>

            <h3>Skills</h3>
            <div className="job-tags modal-tags">
              {selectedJob.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>

            <div className="modal-actions">
              <button
                className="secondary-action"
                onClick={() => toggleSaved(selectedJob.id)}
              >
                {savedJobs.includes(selectedJob.id) ? "♥ Saved" : "♡ Save job"}
              </button>
              <a
                className="apply-button"
                href={selectedJob.applyUrl}
                target="_blank"
                rel="noreferrer"
              >
                Demo apply link ↗
              </a>
            </div>
            <p className="demo-note">
              Sample listing: the application link is a placeholder and does not submit a real application.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
