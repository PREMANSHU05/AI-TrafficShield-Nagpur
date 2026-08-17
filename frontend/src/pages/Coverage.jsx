import { useMemo, useState } from "react";

const initialLocations = [
  { name: "Sitabuldi", risk: 87, currentOfficers: 1, requiredOfficers: 4 },
  { name: "Sadar", risk: 82, currentOfficers: 0, requiredOfficers: 3 },
  { name: "Hingna", risk: 71, currentOfficers: 2, requiredOfficers: 3 },
  { name: "Manish Nagar", risk: 58, currentOfficers: 2, requiredOfficers: 2 },
  { name: "Manewada", risk: 39, currentOfficers: 1, requiredOfficers: 1 },
];

function Coverage() {
  const [availableOfficers, setAvailableOfficers] = useState(5);
  const [locations, setLocations] = useState(initialLocations);
  const [allocation, setAllocation] = useState([]);
  const [deploymentStatus, setDeploymentStatus] = useState("PENDING");
  const [modifiedAllocation, setModifiedAllocation] = useState({});

  const priorityLocations = useMemo(
    () =>
      locations
        .map((location) => {
          const shortage = Math.max(
            location.requiredOfficers - location.currentOfficers,
            0,
          );
          const priorityScore = location.risk + shortage * 10;

          return { ...location, shortage, priorityScore };
        })
        .filter((location) => location.risk >= 50)
        .sort(
          (a, b) =>
            b.priorityScore - a.priorityScore || b.risk - a.risk,
        ),
    [locations],
  );

  const coverageGaps = priorityLocations.filter(
    (location) => location.risk >= 70 && location.shortage > 0,
  );

  const calculateAllocation = () => {
    let remaining = Math.max(Number(availableOfficers) || 0, 0);

    const result = priorityLocations.map((location) => {
      const officersNeeded = Math.max(location.shortage, 0);
      const assigned = Math.min(officersNeeded, remaining);

      remaining -= assigned;

      return { ...location, assigned };
    });

    setAllocation(result);
    setModifiedAllocation({});
    setDeploymentStatus("PENDING");
  };

  const updateAllocation = (locationName, value) => {
    const requested = Math.max(Number(value) || 0, 0);
    const allocatedElsewhere = allocation.reduce(
      (total, location) =>
        location.name === locationName
          ? total
          : total + (modifiedAllocation[location.name] ?? location.assigned),
      0,
    );
    const maximumForLocation = Math.max(
      Number(availableOfficers) - allocatedElsewhere,
      0,
    );

    setModifiedAllocation((current) => ({
      ...current,
      [locationName]: Math.min(requested, maximumForLocation),
    }));
    setDeploymentStatus("MODIFIED");
  };

  const getAssignedOfficers = (location) =>
    modifiedAllocation[location.name] ?? location.assigned;

  const assignedOfficers = allocation.reduce(
    (total, location) => total + getAssignedOfficers(location),
    0,
  );

  const acceptRecommendation = () => {
    if (!allocation.length || assignedOfficers === 0) return;

    setLocations((currentLocations) =>
      currentLocations.map((location) => {
        const plan = allocation.find((item) => item.name === location.name);
        return plan
          ? {
              ...location,
              currentOfficers:
                location.currentOfficers + getAssignedOfficers(plan),
            }
          : location;
      }),
    );
    setAvailableOfficers((current) =>
      Math.max(Number(current) - assignedOfficers, 0),
    );
    setAllocation([]);
    setModifiedAllocation({});
    setDeploymentStatus("ACCEPTED");
  };

  const rejectRecommendation = () => {
    setAllocation([]);
    setModifiedAllocation({});
    setDeploymentStatus("REJECTED");
  };

  const unstaffed = coverageGaps.filter(
    (location) => location.currentOfficers === 0,
  ).length;
  const priorityLocation = priorityLocations[0];

  return (
    <main className="coverage-page">
      <header className="coverage-header">
        <div>
          <h1>👮 Police Coverage Monitor</h1>
          <p>Monitor high-risk locations that need additional police coverage.</p>
        </div>
      </header>

      <section className="coverage-stats" aria-label="Coverage summary">
        <div className="coverage-stat"><span>High-Risk</span><strong>{coverageGaps.length}</strong></div>
        <div className="coverage-stat"><span>Under-Covered</span><strong>{coverageGaps.length}</strong></div>
        <div className="coverage-stat"><span>Unstaffed</span><strong>{unstaffed}</strong></div>
      </section>

      <section className="priority-panel">
        <h2>🚨 Police Attention Priority</h2>
        <p>Locations are ranked using traffic risk and police coverage gaps.</p>

        <div className="priority-list">
          {priorityLocations.map((location, index) => (
            <div className="priority-item" key={location.name}>
              <div className="priority-number">#{index + 1}</div>
              <div className="priority-info">
                <strong>{location.name}</strong>
                <span>Risk: {location.risk}/100</span>
              </div>
              <div className="priority-score">
                Priority
                <strong>{location.priorityScore}</strong>
              </div>
              <div>
                {location.shortage > 0 ? (
                  <span className="status-badge undercovered">
                    +{location.shortage} officer{location.shortage === 1 ? "" : "s"} needed
                  </span>
                ) : (
                  <span className="status-badge covered">COVERED</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="allocation-panel">
        <div className="allocation-header">
          <div>
            <h2>👮 AI Personnel Allocation</h2>
            <p>Allocate limited officers to the highest-priority locations.</p>
          </div>

          <div className="officer-input">
            <label htmlFor="available-officers">Available Officers</label>
            <input
              id="available-officers"
              type="number"
              min="0"
              value={availableOfficers}
              onChange={(event) => setAvailableOfficers(event.target.value)}
            />
          </div>
        </div>

        <button
          className="allocate-button"
          type="button"
          onClick={calculateAllocation}
        >
          🤖 Calculate Best Allocation
        </button>

        {allocation.length > 0 && (
          <p className="allocation-summary">
            {assignedOfficers} of {Math.max(Number(availableOfficers) || 0, 0)}
            {" "}available officers assigned.
          </p>
        )}

        {allocation.length > 0 && (
          <div className="allocation-results">
            <h3>Recommended Deployment</h3>
            {allocation.map((location) => (
              <div className="allocation-row" key={location.name}>
                <div>
                  <strong>{location.name}</strong>
                  <small>Risk: {location.risk}/100</small>
                </div>
                <div>Required: {location.requiredOfficers}</div>
                <div>Current: {location.currentOfficers}</div>
                <div className="assigned-officers">
                  <label htmlFor={`allocation-${location.name}`}>Deploy</label>
                  <input
                    id={`allocation-${location.name}`}
                    type="number"
                    min="0"
                    max={availableOfficers}
                    value={modifiedAllocation[location.name] ?? location.assigned}
                    onChange={(event) =>
                      updateAllocation(location.name, event.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <div className="decision-controls">
              <h3>Control Room Decision</h3>
              <p>Review the AI recommendation before deployment.</p>
              <div className="decision-buttons">
                <button
                  className="accept-button"
                  type="button"
                  onClick={acceptRecommendation}
                  disabled={assignedOfficers === 0}
                >
                  ✓ Accept Recommendation
                </button>
                <button
                  className="modify-button"
                  type="button"
                  onClick={() => setDeploymentStatus("MODIFIED")}
                >
                  ✎ Modify Recommendation
                </button>
                <button
                  className="reject-button"
                  type="button"
                  onClick={rejectRecommendation}
                >
                  ✕ Reject Recommendation
                </button>
              </div>

              {deploymentStatus !== "PENDING" && (
                <div className="decision-status">
                  <strong>Decision:</strong> {deploymentStatus}
                </div>
              )}
              {deploymentStatus === "ACCEPTED" && (
                <div className="success-message">
                  ✓ AI recommendation accepted. Deployment is ready for execution.
                </div>
              )}
              {deploymentStatus === "MODIFIED" && (
                <div className="warning-message">
                  ⚠ Recommendation modified by the authorized operator.
                </div>
              )}
              {deploymentStatus === "REJECTED" && (
                <div className="danger-message">
                  ✕ AI recommendation rejected. No deployment action will be taken.
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {deploymentStatus === "ACCEPTED" && (
        <div className="success-message" role="status">
          Deployment accepted and coverage levels have been updated.
        </div>
      )}
      {deploymentStatus === "REJECTED" && (
        <div className="danger-message" role="status">
          Deployment plan rejected and cleared.
        </div>
      )}

      <section className="coverage-table-section">
        <h2>🚨 High-Priority Coverage Gaps</h2>
        <div className="coverage-table" role="table" aria-label="High-priority coverage gaps">
          <div className="coverage-row coverage-heading" role="row">
            <span>Location</span><span>Risk</span><span>Priority</span><span>Current</span><span>Required</span><span>Gap</span><span>Status</span>
          </div>
          {priorityLocations.map((location, index) => {
            const isUnstaffed = location.currentOfficers === 0;
            const isCovered = location.shortage === 0;
            return (
              <div className="coverage-row priority-row" role="row" key={location.name}>
                <span><strong>#{index + 1} {location.name}</strong></span>
                <span><strong>{location.risk}</strong>/100</span>
                <span><strong>{location.priorityScore}</strong></span>
                <span>{location.currentOfficers}</span>
                <span>{location.requiredOfficers}</span>
                <span className="shortage">+{location.shortage}</span>
                <span>
                  <span
                    className={`status-badge ${
                      isCovered ? "covered" : isUnstaffed ? "unstaffed" : "undercovered"
                    }`}
                  >
                    {isCovered ? "COVERED" : isUnstaffed ? "UNSTAFFED" : "UNDER-COVERED"}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {priorityLocation && (
        <section className="ai-coverage-recommendation">
          <h2>🤖 AI Coverage Recommendation</h2>
          <div className="recommendation-box">
            <p>
              <strong>{priorityLocation.name}</strong> requires immediate attention because its risk score is <strong>{priorityLocation.risk}/100</strong> while only <strong>{priorityLocation.currentOfficers} officer{priorityLocation.currentOfficers === 1 ? "" : "s"}</strong> {priorityLocation.currentOfficers === 1 ? "is" : "are"} deployed against <strong>{priorityLocation.requiredOfficers} required</strong>.
            </p>
            <p><strong>Recommended Action:</strong> Deploy {priorityLocation.shortage} additional officer{priorityLocation.shortage === 1 ? "" : "s"} to {priorityLocation.name}.</p>
          </div>
        </section>
      )}
    </main>
  );
}

export default Coverage;
