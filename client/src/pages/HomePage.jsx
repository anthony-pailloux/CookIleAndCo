// Page d accueil : hero, quelques recettes, categories et origines.
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { listRecipes } from "../services/recipeServices.js";
import { listCategories, listOrigins } from "../services/referenceServices.js";
import { recordPageView } from "../services/recipeViewServices.js";
import { getRecipePhotoUrl } from "../utils/recipePhotoUrl.js";
import RecipeCard from "../components/RecipeCard.jsx";
import "./HomePage.css";
import "../components/Button.css";
import aboutImage from "../assets/table-familiale-cuisine-du-monde-nappe-madras-rhum.webp";

function readReducedMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }

  return false;
}

function readWideLayout() {
  if (window.matchMedia("(min-width: 768px)").matches) {
    return true;
  }

  return false;
}

// Le volet À propos ne s'ouvre tout seul qu'en disposition côte à côte.
function readAboutSideBySide() {
  if (window.matchMedia("(min-width: 1024px)").matches) {
    return true;
  }

  return false;
}

// Bloque le second envoi de StrictMode, puis se libère au départ de la page.
let homePageViewSent = false;

function HomePage() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [instantJump, setInstantJump] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isPointerPaused, setIsPointerPaused] = useState(false);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(readReducedMotion);
  const [isWideLayout, setIsWideLayout] = useState(readWideLayout);
  const [isAboutSideBySide, setIsAboutSideBySide] = useState(readAboutSideBySide);
  // Fermé au départ : à partir de 1024 px, isAboutSideBySide le rouvre dès le premier affichage.
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const carouselRef = useRef(null);
  const keyboardModeRef = useRef(false);

  useEffect(function () {
    if (homePageViewSent) {
      return;
    }

    homePageViewSent = true;

    recordPageView("home").catch(function () {
      // Échec réseau : l'accueil reste utilisable.
    });

    return function () {
      setTimeout(function () {
        homePageViewSent = false;
      }, 0);
    };
  }, []);

  useEffect(() => {
    async function loadFeaturedRecipes() {
      try {
        // Liste déjà triée par createdAt DESC : les 3 premières sont les plus récentes.
        const response = await listRecipes({ page: 1, limit: 3 });

        if (Array.isArray(response.data)) {
          setFeaturedRecipes(response.data);
        } else {
          setFeaturedRecipes([]);
        }
      } catch (err) {
        setFeaturedRecipes([]);
      }
    }

    loadFeaturedRecipes();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncReducedMotion() {
      if (mediaQuery.matches) {
        setPrefersReducedMotion(true);
      } else {
        setPrefersReducedMotion(false);
      }
    }

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", syncReducedMotion);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function syncWideLayout() {
      if (mediaQuery.matches) {
        setIsWideLayout(true);
      } else {
        setIsWideLayout(false);
      }
    }

    syncWideLayout();
    mediaQuery.addEventListener("change", syncWideLayout);

    return () => {
      mediaQuery.removeEventListener("change", syncWideLayout);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function syncAboutSideBySide() {
      if (mediaQuery.matches) {
        setIsAboutSideBySide(true);
      } else {
        setIsAboutSideBySide(false);
      }
    }

    syncAboutSideBySide();
    mediaQuery.addEventListener("change", syncAboutSideBySide);

    return () => {
      mediaQuery.removeEventListener("change", syncAboutSideBySide);
    };
  }, []);

  let autoplayEnabled = true;
  if (featuredRecipes.length < 2) {
    autoplayEnabled = false;
  } else if (prefersReducedMotion) {
    autoplayEnabled = false;
  } else if (isManuallyPaused) {
    autoplayEnabled = false;
  } else if (isPointerPaused) {
    autoplayEnabled = false;
  } else if (isFocusPaused) {
    autoplayEnabled = false;
  }

  useEffect(() => {
    if (autoplayEnabled === false) {
      return;
    }

    // La fenêtre avance d'une carte toutes les 3 secondes.
    const intervalId = window.setInterval(() => {
      setSlideIndex((previousIndex) => {
        let baseIndex = previousIndex;
        if (baseIndex >= featuredRecipes.length) {
          baseIndex = 0;
        }

        let nextIndex = baseIndex + 1;
        if (nextIndex >= featuredRecipes.length) {
          nextIndex = featuredRecipes.length;
        }
        return nextIndex;
      });
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoplayEnabled, featuredRecipes.length]);

  useEffect(() => {
    if (instantJump === false) {
      return;
    }
    if (slideIndex !== 0) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setInstantJump(false);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [instantJump, slideIndex]);

  function showPreviousRecipe() {
    if (featuredRecipes.length < 2) {
      return;
    }

    if (slideIndex === 0) {
      setInstantJump(true);
      setSlideIndex(featuredRecipes.length);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setInstantJump(false);
          setSlideIndex(featuredRecipes.length - 1);
        });
      });
    } else {
      let nextIndex = slideIndex - 1;
      if (nextIndex < 0) {
        nextIndex = featuredRecipes.length - 1;
      }
      setInstantJump(false);
      setSlideIndex(nextIndex);
    }
  }

  function showNextRecipe() {
    setSlideIndex((previousIndex) => {
      let baseIndex = previousIndex;
      if (baseIndex >= featuredRecipes.length) {
        baseIndex = 0;
      }

      let nextIndex = baseIndex + 1;
      if (nextIndex >= featuredRecipes.length) {
        if (prefersReducedMotion) {
          nextIndex = 0;
        } else {
          nextIndex = featuredRecipes.length;
        }
      }
      return nextIndex;
    });
    setInstantJump(false);
  }

  function showRecipeAtIndex(index) {
    setInstantJump(false);
    setSlideIndex(index);
  }

  function handleTrackTransitionEnd(event) {
    if (event.propertyName !== "transform") {
      return;
    }
    if (event.target !== event.currentTarget) {
      return;
    }
    if (slideIndex === featuredRecipes.length) {
      setInstantJump(true);
      setSlideIndex(0);
    }
  }

  function handlePlayPauseClick() {
    if (prefersReducedMotion) {
      return;
    }

    if (isManuallyPaused) {
      setIsManuallyPaused(false);
    } else {
      setIsManuallyPaused(true);
    }
  }

  function handleCarouselMouseEnter() {
    setIsPointerPaused(true);
  }

  function handleCarouselMouseLeave() {
    setIsPointerPaused(false);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Tab") {
        keyboardModeRef.current = true;
      }
    }

    function handlePointerDown() {
      keyboardModeRef.current = false;
      setIsFocusPaused(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function handleCarouselFocus() {
    if (keyboardModeRef.current) {
      setIsFocusPaused(true);
    }
  }

  function handleCarouselBlur(event) {
    const nextTarget = event.relatedTarget;
    if (carouselRef.current !== null && nextTarget !== null) {
      if (carouselRef.current.contains(nextTarget)) {
        return;
      }
    }

    setIsFocusPaused(false);
  }

  function handleAboutToggle(event) {
    // Le navigateur a ouvert ou fermé le <details> : on retient cet état.
    // À partir de 1024 px l'ouverture est forcée : ce n'est pas un clic à mémoriser.
    if (isAboutSideBySide === false) {
      setIsAboutOpen(event.currentTarget.open);
    }
  }

  let playButtonLabel = "Pause";
  if (prefersReducedMotion) {
    playButtonLabel = "Lecture";
  } else if (isManuallyPaused) {
    playButtonLabel = "Lecture";
  }

  // 2 cartes visibles à partir de 768px (plus larges), 1 en dessous.
  let cardsPerView = 1;
  if (isWideLayout) {
    cardsPerView = 2;
  }
  if (cardsPerView > featuredRecipes.length) {
    cardsPerView = featuredRecipes.length;
  }

  let activeIndex = slideIndex;
  if (featuredRecipes.length > 0 && activeIndex >= featuredRecipes.length) {
    activeIndex = 0;
  }

  const trackItems = [];
  let sourceIndex = 0;
  while (sourceIndex < featuredRecipes.length) {
    trackItems.push({
      recipe: featuredRecipes[sourceIndex],
      key: "recipe-" + featuredRecipes[sourceIndex].id + "-" + sourceIndex,
    });
    sourceIndex = sourceIndex + 1;
  }

  // Autant de clones que de cartes visibles, pour boucler sans trou.
  let cloneCount = cardsPerView;
  if (cloneCount > featuredRecipes.length) {
    cloneCount = featuredRecipes.length;
  }

  let cloneIndex = 0;
  while (cloneIndex < cloneCount) {
    trackItems.push({
      recipe: featuredRecipes[cloneIndex],
      key: "recipe-loop-" + featuredRecipes[cloneIndex].id + "-" + cloneIndex,
    });
    cloneIndex = cloneIndex + 1;
  }

  let trackClassName = "home__recipes-track";
  if (prefersReducedMotion) {
    trackClassName = "home__recipes-track home__recipes-track--instant";
  } else if (instantJump) {
    trackClassName = "home__recipes-track home__recipes-track--instant";
  }

  // Un pas = une carte : (largeur du rail + écart) / nombre de cartes visibles.
  let stepCount = cardsPerView;
  if (stepCount < 1) {
    stepCount = 1;
  }

  const trackStyle = {
    transform:
      "translateX(calc(" +
      String(-slideIndex) +
      " * ((100% + 1.25rem) / " +
      String(stepCount) +
      ")))",
  };

  let playGlyph = (
    <span className="home__recipes-glyph home__recipes-glyph--pause" aria-hidden="true">
      <span />
      <span />
    </span>
  );
  if (playButtonLabel === "Lecture") {
    playGlyph = (
      <span className="home__recipes-glyph home__recipes-glyph--play" aria-hidden="true" />
    );
  }

  const [featuredCategories, setFeaturedCategories] = useState([]);

  useEffect(() => {
    async function loadFeaturedCategories() {
      try {
        const response = await listCategories();
        const firstThree = response.data.slice(0, 3);
        setFeaturedCategories(firstThree);
      } catch (err) {
        setFeaturedCategories([]);
      }
    }

    loadFeaturedCategories();
  }, []);

  const [origins, setOrigins] = useState([]);
  const [originsLoading, setOriginsLoading] = useState(true);

  useEffect(() => {
    async function loadOrigins() {
      try {
        const response = await listOrigins();

        if (Array.isArray(response.data)) {
          setOrigins(response.data.slice(0, 3));
        } else {
          setOrigins([]);
        }
      } catch (err) {
        setOrigins([]);
      }

      setOriginsLoading(false);
    }

    loadOrigins();
  }, []);

  // Côte à côte (1024 px) : texte toujours visible. En dessous : on suit le clic.
  let aboutOpen = false;
  if (isAboutSideBySide) {
    aboutOpen = true;
  } else {
    aboutOpen = isAboutOpen;
  }

  return (
    <main className="home">
      <section className="home__hero">
        <div className="home__hero-media" aria-hidden="true">
          <img
            className="home__hero-img"
            src="/hero-cuisine-antillaise.webp"
            alt=""
            width={1900}
            height={800}
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div className="home__hero-overlay" />
        </div>
        <div className="home__hero-content">
          <h1>Cook'île & Co</h1>
          <p className="home__hero-accroche home__hero-accroche--italic">
            "An Nou Ay !"
          </p>
          <p className="home__hero-accroche">
            Des antilles aux saveurs du monde
          </p>
        </div>
      </section>

      <section className="home__about">
        <div className="home__frame">
          <div className="home__frame-inner">
            {/* Surtitre + titre : hors du <details>, donc visibles même texte replié. */}
            <header className="home__about-header">
              <p className="home__about-eyebrow">À propos</p>
              <h2 className="home__about-title">Bienvenue à ma table</h2>
            </header>
            {/* Le conteneur porte le cadre or décalé derrière la photo. */}
            <div className="home__about-media">
              <img
                className="home__about-img"
                src={aboutImage}
                alt="Table familiale aux saveurs des Antilles"
                width={640}
                height={427}
                loading="lazy"
                decoding="async"
              />
            </div>
            <details
              className="home__about-details"
              open={aboutOpen}
              onToggle={handleAboutToggle}
            >
              <summary className="home__about-summary">Lire la présentation</summary>
              <div className="home__about-text">
                <p>
                  Bienvenue chez Cook'île & Co, un univers gourmand où les saveurs des
                  Antilles et du monde se rencontrent, se partagent et se dégustent !
                </p>
                <p>
                  Les Antilles y occupent une place particulière, avec leurs recettes
                  traditionnelles, spécialités emblématiques, douceurs maison et
                  produits qui sentent bon le soleil et les souvenirs de famille. Mais
                  je vous emmène aussi à la découverte des saveurs d’ailleurs, à
                  travers des recettes, des spécialités, des découvertes gourmandes et
                  mes coups de cœur culinaires.
                </p>
                <p>
                  Cook'île & Co, c’est avant tout une histoire de cuisine, de partage,
                  de découverte et de gourmandise, avec des recettes accessibles à
                  cuisiner simplement, à votre rythme et surtout avec plaisir. Alors,
                  prenez place, ouvrez grand vos papilles et laissez-vous embarquer
                  pour un voyage gourmand…
                </p>
                <p className="home__about-signature">An nou ay ! Tetelle</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section
        className="home__recipes"
        aria-roledescription="carrousel"
        aria-labelledby="home-recipes-heading"
      >
        <h2 id="home-recipes-heading" className="home__heading">
          Quelques recettes
        </h2>

        <div className="home__frame">
          <div
            className="home__frame-inner home__recipes-carousel"
            ref={carouselRef}
            onMouseEnter={handleCarouselMouseEnter}
            onMouseLeave={handleCarouselMouseLeave}
            onFocus={handleCarouselFocus}
            onBlur={handleCarouselBlur}
          >
            {featuredRecipes.length === 0 && (
              <p className="home__recipes-empty">Aucune recette pour le moment.</p>
            )}

            {trackItems.length > 0 && (
              <div className="home__recipes-stage">
                <div className="home__recipes-viewport">
                  <ul
                    className={trackClassName}
                    style={trackStyle}
                    onTransitionEnd={handleTrackTransitionEnd}
                  >
                    {trackItems.map((item) => {
                      return (
                        <li key={item.key} className="home__recipes-item">
                          {/* Sous le hero : lazy, pour ne pas concurrencer le LCP. */}
                          <RecipeCard
                            recipe={item.recipe}
                            showTimes={false}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {featuredRecipes.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="home__recipes-arrow home__recipes-arrow--prev"
                      onClick={showPreviousRecipe}
                      aria-label="Recette précédente"
                    >
                      <span aria-hidden="true">‹</span>
                    </button>

                    <button
                      type="button"
                      className="home__recipes-arrow home__recipes-arrow--next"
                      onClick={showNextRecipe}
                      aria-label="Recette suivante"
                    >
                      <span aria-hidden="true">›</span>
                    </button>

                    <button
                      type="button"
                      className="home__recipes-play"
                      onClick={handlePlayPauseClick}
                      aria-label={playButtonLabel}
                    >
                      {playGlyph}
                    </button>

                    <ul className="home__recipes-dots">
                      {featuredRecipes.map((recipe, recipeIndex) => {
                        let isCurrent = false;
                        if (recipeIndex === activeIndex) {
                          isCurrent = true;
                        }

                        let ariaCurrent = "false";
                        if (isCurrent) {
                          ariaCurrent = "true";
                        }

                        let dotClassName = "home__recipes-dot";
                        if (isCurrent) {
                          dotClassName = "home__recipes-dot home__recipes-dot--current";
                        }

                        let recipeLabel = "Recette " + (recipeIndex + 1);
                        if (typeof recipe.title === "string" && recipe.title !== "") {
                          recipeLabel = recipe.title;
                        }

                        return (
                          <li key={recipe.id}>
                            <button
                              type="button"
                              className={dotClassName}
                              aria-label={recipeLabel}
                              aria-current={ariaCurrent}
                              onClick={() => {
                                showRecipeAtIndex(recipeIndex);
                              }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <Link className="btn home__recipes-cta" to="/recettes">
          Voir toutes les recettes
        </Link>
      </section>

      <section className="home__categories">
        <h2 className="home__heading">Parcourir par catégorie</h2>

        <div className="home__frame">
          <div className="home__frame-inner">
            {featuredCategories.length === 0 && (
              <p className="home__categories-empty">
                Aucune catégorie pour le moment.
              </p>
            )}

            {featuredCategories.length > 0 && (
              <ul className="home__categories-grid">
                {featuredCategories.map((category) => {
                  return (
                    <li key={category.id}>
                      <Link
                        className="home__categories-card"
                        to={
                          "/recettes?" +
                          new URLSearchParams({
                            categorie: category.name,
                          }).toString()
                        }
                      >
                        <div className="home__categories-photo">
                          <img
                            src={getRecipePhotoUrl(category.image)}
                            alt={category.name}
                            loading="lazy"
                            decoding="async"
                          />
                          <span className="home__categories-name">
                            {category.name}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <Link className="btn home__categories-cta" to="/categories">
          Voir toutes les catégories
        </Link>
      </section>

      <section className="home__origins" aria-busy={originsLoading}>
        <h2 className="home__heading">Parcourir par origines</h2>

        <div className="home__frame">
          <div className="home__frame-inner">
            {originsLoading && (
              <p className="home__origins-status" role="status">
                Chargement des origines…
              </p>
            )}

            {originsLoading === false && origins.length === 0 && (
              <p className="home__origins-status">
                Aucune origine pour le moment.
              </p>
            )}

            {originsLoading === false && origins.length > 0 && (
              <ul className="home__origins-grid">
                {origins.map((origin) => {
                  return (
                    <li key={origin.id}>
                      <Link
                        className="home__origins-card"
                        to={
                          "/recettes?" +
                          new URLSearchParams({
                            origine: origin.name,
                          }).toString()
                        }
                      >
                        <div className="home__origins-photo">
                          <img
                            src={getRecipePhotoUrl(origin.image)}
                            alt={origin.name}
                            loading="lazy"
                            decoding="async"
                          />
                          <span className="home__origins-name">
                            {origin.name}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <Link className="btn home__origins-cta" to="/categories">
          Voir toutes les origines
        </Link>
      </section>
    </main>
  );
}

export default HomePage;
