// Tableau de bord : flux des pages publiques, et fiches ouvertes hors sessions admin.
import { useEffect, useState } from "react";
import AdminSectionNav from "../components/AdminSectionNav.jsx";
import { getRecipeViewStats } from "../services/recipeViewServices.js";
import "./AdminPage.css";

const periods = [
  { id: "1h", label: "1 h" },
  { id: "4h", label: "4 h" },
  { id: "7d", label: "7 j" },
  { id: "30d", label: "30 j" },
];

const chartWidth = 640;
const chartHeight = 280;
const chartPadLeft = 46;
const chartPadRight = 16;
const chartPadTop = 16;
const chartPadBottom = 36;

function getPeriodClassName(isActive) {
  if (isActive) {
    return "admin-page__tab admin-page__tab--active";
  } else {
    return "admin-page__tab";
  }
}

function viewWord(count) {
  let word = "vues";
  const absolute = Math.abs(count);

  if (absolute === 1) {
    word = "vue";
  }

  return word;
}

function periodPhrase(period) {
  let phrase = "7 jours";

  if (period === "1h") {
    phrase = "1 heure";
  } else if (period === "4h") {
    phrase = "4 heures";
  } else if (period === "30d") {
    phrase = "30 jours";
  } else {
    phrase = "7 jours";
  }

  return phrase;
}

function readCount(value) {
  const count = Number(value);
  let result = 0;

  if (Number.isNaN(count) === false) {
    result = count;
  }

  return result;
}

function formatUpdatedAt(iso) {
  let text = "";

  if (iso) {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime()) === false) {
      text = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
  }

  return text;
}

function formatDeltaValue(total, previousTotal) {
  const delta = total - previousTotal;
  let text = "Égal";

  if (delta > 0) {
    text = "+" + delta + " " + viewWord(delta);
  } else if (delta < 0) {
    const absolute = Math.abs(delta);
    text = "−" + absolute + " " + viewWord(absolute);
  }

  return text;
}

function deltaClassName(total, previousTotal) {
  const delta = total - previousTotal;
  let className = "admin-stats__card-value admin-stats__delta admin-stats__delta--flat";

  if (delta > 0) {
    className = "admin-stats__card-value admin-stats__delta admin-stats__delta--up";
  } else if (delta < 0) {
    className = "admin-stats__card-value admin-stats__delta admin-stats__delta--down";
  }

  return className;
}

function barWidth(count, maxCount) {
  let width = "0%";

  if (maxCount > 0) {
    const ratio = (count / maxCount) * 100;
    width = ratio + "%";
  }

  return width;
}

function maxCountOf(rows) {
  let maxCount = 0;

  for (let index = 0; index < rows.length; index++) {
    if (rows[index].count > maxCount) {
      maxCount = rows[index].count;
    }
  }

  return maxCount;
}

function pageTypeLabel(pageType) {
  let label = "Fiche recette";

  if (pageType === "home") {
    label = "Accueil";
  } else if (pageType === "catalog") {
    label = "Catalogue";
  } else if (pageType === "categories") {
    label = "Catégorie et origine";
  } else if (pageType === "recipe") {
    label = "Fiche recette";
  }

  return label;
}

function shareLabel(count, total) {
  let share = 0;

  if (total > 0) {
    share = Math.round((count / total) * 100);
  }

  return share + " %";
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function shouldShowTick(index, length) {
  let show = false;

  if (length <= 12) {
    show = true;
  } else if (index === 0 || index === length - 1) {
    show = true;
  } else if (index % 5 === 0 && length - 1 - index >= 5) {
    show = true;
  }

  return show;
}

function StatsChart(props) {
  const series = props.series;
  const total = props.total;
  const period = props.period;
  const [hoverIndex, setHoverIndex] = useState(null);
  const [focusIndex, setFocusIndex] = useState(null);

  useEffect(
    function () {
      setHoverIndex(null);
      setFocusIndex(null);
    },
    [period],
  );

  let activeIndex = hoverIndex;

  if (hoverIndex === null) {
    activeIndex = focusIndex;
  }

  const chartLabel =
    "Fiches ouvertes sur " +
    periodPhrase(period) +
    " : " +
    total +
    " " +
    viewWord(total);

  let maxCount = 0;

  for (let index = 0; index < series.length; index++) {
    if (series[index].count > maxCount) {
      maxCount = series[index].count;
    }
  }

  let scaleMax = maxCount;

  if (scaleMax < 1) {
    scaleMax = 1;
  }

  const innerWidth = chartWidth - chartPadLeft - chartPadRight;
  const innerHeight = chartHeight - chartPadTop - chartPadBottom;
  const baseline = chartPadTop + innerHeight;
  const points = [];

  for (let index = 0; index < series.length; index++) {
    let x = chartPadLeft;

    if (series.length > 1) {
      x = chartPadLeft + (index / (series.length - 1)) * innerWidth;
    } else {
      x = chartPadLeft + innerWidth / 2;
    }

    const ratio = series[index].count / scaleMax;
    const y = chartPadTop + innerHeight - ratio * innerHeight;

    points.push({
      x: round1(x),
      y: round1(y),
      label: series[index].label,
      count: series[index].count,
    });
  }

  let areaPath = "";
  let linePath = "";

  if (points.length > 0) {
    areaPath = "M " + points[0].x + " " + points[0].y;
    linePath = "M " + points[0].x + " " + points[0].y;

    for (let index = 1; index < points.length; index++) {
      areaPath = areaPath + " L " + points[index].x + " " + points[index].y;
      linePath = linePath + " L " + points[index].x + " " + points[index].y;
    }

    const lastPoint = points[points.length - 1];
    areaPath = areaPath + " L " + lastPoint.x + " " + round1(baseline);
    areaPath = areaPath + " L " + points[0].x + " " + round1(baseline) + " Z";
  }

  const ticks = [0];

  if (maxCount > 1) {
    const mid = Math.round(maxCount / 2);

    if (mid !== 0 && mid !== maxCount) {
      ticks.push(mid);
    }
  }

  if (maxCount > 0) {
    ticks.push(maxCount);
  }

  let hitRadius = 14;

  if (series.length > 12) {
    hitRadius = 10;
  }

  let detail = "Passez sur un point pour le détail.";

  if (total === 0) {
    detail = "Aucune fiche ouverte sur cette période";
  }

  if (activeIndex !== null && points[activeIndex]) {
    const activePoint = points[activeIndex];
    detail =
      activePoint.label +
      " · " +
      activePoint.count +
      " " +
      viewWord(activePoint.count);
  }

  let guide = null;

  if (activeIndex !== null && points[activeIndex]) {
    const activePoint = points[activeIndex];
    guide = (
      <line
        className="admin-stats__chart-guide"
        x1={activePoint.x}
        y1={activePoint.y}
        x2={activePoint.x}
        y2={round1(baseline)}
      />
    );
  }

  return (
    <section className="admin-page__section admin-stats__section admin-stats__chart-card">
      <h2 className="admin-page__section-title">Évolution des visites</h2>
      <p className="admin-stats__section-note">Fiches ouvertes</p>
      <p className="admin-stats__chart-detail">{detail}</p>
      <svg
        className="admin-stats__chart"
        viewBox={"0 0 " + chartWidth + " " + chartHeight}
        role="img"
        aria-label={chartLabel}
      >
        <title>{chartLabel}</title>
        <rect
          className="admin-stats__chart-bg"
          x="0"
          y="0"
          width={chartWidth}
          height={chartHeight}
          rx="12"
        />
        {ticks.map(function (tick) {
          const ratio = tick / scaleMax;
          const y = round1(chartPadTop + innerHeight - ratio * innerHeight);

          return (
            <g key={tick}>
              <line
                className="admin-stats__chart-grid"
                x1={chartPadLeft}
                y1={y}
                x2={chartWidth - chartPadRight}
                y2={y}
              />
              <text
                className="admin-stats__chart-label"
                x={chartPadLeft - 8}
                y={y + 4}
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          );
        })}
        <path className="admin-stats__chart-area" d={areaPath} />
        <path className="admin-stats__chart-line" d={linePath} />
        {guide}
        {points.map(function (point, index) {
          let tickLabel = null;

          if (shouldShowTick(index, points.length)) {
            let anchor = "middle";

            if (index === 0) {
              anchor = "start";
            } else if (index === points.length - 1) {
              anchor = "end";
            }

            tickLabel = (
              <text
                className="admin-stats__chart-label"
                x={point.x}
                y={chartHeight - 10}
                textAnchor={anchor}
              >
                {point.label}
              </text>
            );
          }

          return <g key={point.label + "-" + index}>{tickLabel}</g>;
        })}
        {points.map(function (point, index) {
          let radius = 4;
          let pointClass = "admin-stats__point";

          if (index === activeIndex) {
            radius = 6;
            pointClass = "admin-stats__point admin-stats__point--active";
          }

          const pointLabel =
            point.label + " : " + point.count + " " + viewWord(point.count);

          return (
            <g
              key={point.label + "-" + index}
              className={pointClass}
              tabIndex={0}
              onMouseEnter={function () {
                setHoverIndex(index);
              }}
              onMouseLeave={function () {
                setHoverIndex(null);
              }}
              onFocus={function () {
                setFocusIndex(index);
              }}
              onBlur={function () {
                setFocusIndex(null);
              }}
            >
              <title>{pointLabel}</title>
              <circle
                className="admin-stats__point-hit"
                cx={point.x}
                cy={point.y}
                r={hitRadius}
              />
              <circle
                className="admin-stats__point-dot"
                cx={point.x}
                cy={point.y}
                r={radius}
              />
            </g>
          );
        })}
      </svg>
    </section>
  );
}

function RankingTable(props) {
  const rows = props.rows;
  const maxCount = props.maxCount;
  const total = props.total;
  const nameLabel = props.nameLabel;
  const nameKey = props.nameKey;
  const showShare = props.showShare;

  let body = (
    <p className="admin-page__status">Aucune fiche ouverte sur cette période</p>
  );

  if (rows.length > 0) {
    body = (
      <div className="admin-page__table-wrap">
        <table className="admin-recipes-table">
          <thead>
            <tr>
              <th>{nameLabel}</th>
              <th>Vues</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(function (row) {
              const width = barWidth(row.count, maxCount);
              let rowKey = row[nameKey];

              if (row.id) {
                rowKey = row.id;
              }

              let share = null;

              if (showShare) {
                share = (
                  <span className="admin-stats__share">
                    {shareLabel(row.count, total)}
                  </span>
                );
              }

              return (
                <tr key={rowKey}>
                  <td data-label={nameLabel}>{row[nameKey]}</td>
                  <td data-label="Vues">
                    <span className="admin-stats__count">
                      <span className="admin-stats__bar" aria-hidden="true">
                        <span
                          className="admin-stats__bar-fill"
                          style={{ width: width }}
                        ></span>
                      </span>
                      <span className="admin-stats__count-value">{row.count}</span>
                      {share}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return body;
}

function LivePages(props) {
  const rows = props.rows;

  let body = (
    <p className="admin-page__status admin-stats__live-empty">
      Aucune visite pour le moment
    </p>
  );

  if (rows.length > 0) {
    body = (
      <ul className="admin-stats__live-list">
        {rows.map(function (row, index) {
          const typeLabel = pageTypeLabel(row.pageType);
          const timeLabel = formatUpdatedAt(row.at);

          return (
            <li
              key={row.at + "-" + row.pageType + "-" + index}
              className="admin-stats__live-item"
            >
              <span className="admin-stats__live-label">{row.label}</span>
              <span className="admin-stats__live-type">{typeLabel}</span>
              <time className="admin-stats__live-time" dateTime={row.at}>
                {timeLabel}
              </time>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section className="admin-page__section admin-stats__section admin-stats__live-feed">
      <h2 className="admin-page__section-title">Visites en direct</h2>
      <p className="admin-stats__section-note">
        Les 15 dernières pages, toutes périodes
      </p>
      <div
        className="admin-stats__live-scroll"
        tabIndex={0}
        aria-label="Visites en direct"
      >
        {body}
      </div>
    </section>
  );
}

function AdminStatsPage() {
  const [period, setPeriod] = useState("7d");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");

  useEffect(
    function () {
      let cancelled = false;
      let intervalId = null;

      async function loadStats(isFirstLoad) {
        if (isFirstLoad) {
          setLoading(true);
          setStats(null);
          setErrorMessage("");
          setRefreshMessage("");
        }

        try {
          const data = await getRecipeViewStats(period);

          if (cancelled === false) {
            setStats(data);
            setRefreshMessage("");
          }
        } catch (err) {
          if (cancelled === false) {
            if (isFirstLoad) {
              setErrorMessage("Impossible de charger les statistiques.");
            } else {
              setRefreshMessage("Actualisation impossible");
            }
          }
        } finally {
          if (cancelled === false && isFirstLoad) {
            setLoading(false);
          }
        }
      }

      loadStats(true);

      intervalId = setInterval(function () {
        loadStats(false);
      }, 10000);

      return function () {
        cancelled = true;
        clearInterval(intervalId);
      };
    },
    [period],
  );

  let statsBody = null;

  if (loading) {
    statsBody = (
      <p className="admin-page__status">Chargement des statistiques...</p>
    );
  } else if (errorMessage !== "") {
    statsBody = <p className="admin-page__status">{errorMessage}</p>;
  } else if (stats) {
    const total = readCount(stats.total);
    const previousTotal = readCount(stats.previousTotal);
    const liveLastMinute = readCount(stats.liveLastMinute);
    let series = [];

    if (stats.series) {
      series = stats.series;
    }

    let topRecipes = [];

    if (stats.topRecipes) {
      topRecipes = stats.topRecipes;
    }

    let byOrigin = [];

    if (stats.byOrigin) {
      byOrigin = stats.byOrigin;
    }

    const topMax = maxCountOf(topRecipes);
    const originMax = maxCountOf(byOrigin);

    let byCategory = [];

    if (stats.byCategory) {
      byCategory = stats.byCategory;
    }

    let livePages = [];

    if (stats.livePages) {
      livePages = stats.livePages;
    }

    const categoryMax = maxCountOf(byCategory);

    statsBody = (
      <>
        <section className="admin-stats__cards" aria-label="Indicateurs">
          <article className="admin-stats__card">
            <p className="admin-stats__card-label">Fiches ouvertes</p>
            <p className="admin-stats__card-value">{total}</p>
            <p className="admin-stats__card-hint">{periodPhrase(stats.period)}</p>
          </article>
          <article className="admin-stats__card">
            <p className="admin-stats__card-label">Dernière minute</p>
            <p className="admin-stats__card-value">{liveLastMinute}</p>
            <p className="admin-stats__card-hint">Pages vues</p>
          </article>
          <article className="admin-stats__card">
            <p className="admin-stats__card-label">Écart</p>
            <p className={deltaClassName(total, previousTotal)}>
              {formatDeltaValue(total, previousTotal)}
            </p>
            <p className="admin-stats__card-hint">
              Fiches ouvertes, période précédente ({previousTotal}{" "}
              {viewWord(previousTotal)})
            </p>
          </article>
        </section>

        <LivePages rows={livePages} />

        <StatsChart series={series} total={total} period={stats.period} />

        <section className="admin-page__section admin-stats__section">
          <h2 className="admin-page__section-title">Recettes les plus vues</h2>
          <p className="admin-stats__section-note">Fiches ouvertes</p>
          <RankingTable
            rows={topRecipes}
            maxCount={topMax}
            total={total}
            nameLabel="Recette"
            nameKey="title"
            showShare={false}
          />
        </section>

        <div className="admin-stats__columns">
          <section className="admin-page__section admin-stats__section">
            <h2 className="admin-page__section-title">Répartition par origine</h2>
            <p className="admin-stats__section-note">Fiches ouvertes</p>
            <RankingTable
              rows={byOrigin}
              maxCount={originMax}
              total={total}
              nameLabel="Origine"
              nameKey="origin"
              showShare={true}
            />
          </section>
          <section className="admin-page__section admin-stats__section">
            <h2 className="admin-page__section-title">Répartition par catégorie</h2>
            <p className="admin-stats__section-note">Fiches ouvertes</p>
            <RankingTable
              rows={byCategory}
              maxCount={categoryMax}
              total={total}
              nameLabel="Catégorie"
              nameKey="category"
              showShare={true}
            />
          </section>
        </div>
      </>
    );
  }

  let liveDotClass = "admin-stats__live-dot";

  if (refreshMessage !== "") {
    liveDotClass = "admin-stats__live-dot admin-stats__live-dot--stale";
  }

  let liveStatus = null;

  if (stats) {
    const updatedAt = formatUpdatedAt(stats.generatedAt);
    let updatedText = "";

    if (updatedAt !== "") {
      updatedText = "Mis à jour à " + updatedAt;
    }

    liveStatus = (
      <p className="admin-stats__live">
        <span className={liveDotClass} aria-hidden="true"></span>
        <span>En direct</span>
        <span className="admin-stats__updated">{updatedText}</span>
      </p>
    );
  }

  let refreshNode = null;

  if (refreshMessage !== "") {
    refreshNode = (
      <p className="admin-stats__refresh" role="status">
        {refreshMessage}
      </p>
    );
  }

  return (
    <main className="admin-page admin-stats-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Statistiques</h1>
        <p className="admin-stats__lead">
          Pages publiques consultées, hors sessions administrateur. Les courbes
          et les répartitions comptent les fiches ouvertes.
        </p>
      </header>

      <AdminSectionNav />

      <div className="admin-stats__controls">
        <div className="admin-stats__periods" role="group" aria-label="Période">
          {periods.map(function (item) {
            const isActive = item.id === period;

            return (
              <button
                key={item.id}
                type="button"
                className={getPeriodClassName(isActive)}
                aria-pressed={isActive}
              onClick={function () {
                if (item.id !== period) {
                  setLoading(true);
                  setStats(null);
                  setErrorMessage("");
                  setRefreshMessage("");
                  setPeriod(item.id);
                }
              }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="admin-stats__live-wrap">
          {liveStatus}
          {refreshNode}
        </div>
      </div>

      {statsBody}
    </main>
  );
}

export default AdminStatsPage;
