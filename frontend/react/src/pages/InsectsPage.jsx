import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";

// Image max size
const MAX_IMAGE_KB = 64;

// Set model
const emptyModel = {
  id: null,
  name: "",
  img: null,       
  img_type: null,  
  type: "",
  metamorphosis: "",
  role: "",
  active_months: "",
  utility_level: 1
};

// Set options
const options = {
  type: [
    "Bogarak",
    "Lepkék",
    "Hártyásszárnyúak",
    "Kétszárnyúak",
    "Poloskák",
    "Egyenesszárnyúak",
    "Szitakötők",
    "Botsáskák",
    "Csótányok"
  ],
  metamorphosis: [
    "Nincs", 
    "Részleges", 
    "Teljes"
  ],
  role: [
    "Beporzás", 
    "Lebontás", 
    "Tápláléklánc", 
    "Kártevőirtás", 
    "Talajképzés", 
    "Kártevő"
  ]
};

// Set field view
const displayKeys = {
  id: "Azonosító",
  name: "Név",
  type: "Típus",
  metamorphosis: "Metamorfózis",
  role: "Szerep",
  active_months: "Aktívitás",
  utility_level: "Hasznossági szint",
};

// Set filter view
const filterKeys = {
  name: "Név",
  type: "Típus",
  metamorphosis: "Metamorfózis",
  role: "Szerep",
  active_months: "Aktívitás",
};

export default function InsectsPage() {

  // 
  const [theme, setTheme] = useState(() => localStorage.getItem("crud-theme") || "dark");
  const [busy, setBusy] = useState(false); 
  const [insects, setInsects] = useState([]);
  const [model, setModel] = useState(emptyModel);
  const [isNew, setIsNew] = useState(true);

  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [order, setOrder] = useState("id");

  // --- bootstrap ref-ek ---
  const offcanvasRef = useRef(null);
  const modalRef = useRef(null);
  const lastActiveRef = useRef(null);

  // Theme 
  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
    localStorage.setItem("crud-theme", theme);
  }, [theme]);

  // Load
  const load = async () => {
    try {
      const r = await api.get("/insects");
      setInsects(r.data?.data || []);
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      alert("Sikertelen betöltés: nem elérhető szerver.");
    }
  };


  useEffect(() => {
    load();
  }, []);

  // Get bootstrap
  const getBootstrap = () => window.bootstrap;

  // Show offcanvas
  const showOffcanvas = () => {
    const bs = getBootstrap();
    if (!bs || !offcanvasRef.current) return;
    const inst = bs.Offcanvas.getOrCreateInstance(offcanvasRef.current);
    inst.show();
  };

  // Hid offcanvas
  const hideOffcanvas = () => {
    const bs = getBootstrap();
    if (!bs || !offcanvasRef.current) return;
    const inst = bs.Offcanvas.getOrCreateInstance(offcanvasRef.current);
    inst.hide();
  };

  // Show modal
  const showModal = () => {
    lastActiveRef.current = document.activeElement;
    const bs = getBootstrap();
    if (!bs || !modalRef.current) return;
    const inst = bs.Modal.getOrCreateInstance(modalRef.current, { 
      backdrop: "static", 
      keyboard: false 
    });
    inst.show();
  };

  // Hide modal
  const hideModal = () => {
    const bs = getBootstrap();
    if (!bs || !modalRef.current) return;
    const inst = bs.Modal.getOrCreateInstance(modalRef.current);
    inst.hide();
  };

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    const onHide = () => {
      const active = document.activeElement;
      if (active instanceof HTMLElement && el.contains(active)) {
        active.blur();
      }
    };

    const onHidden = () => {
      const prev = lastActiveRef.current;
      if (prev instanceof HTMLElement) {
        prev.focus();
      }
    };

    el.addEventListener("hide.bs.modal", onHide);
    el.addEventListener("hidden.bs.modal", onHidden);

    return () => {
      el.removeEventListener("hide.bs.modal", onHide);
      el.removeEventListener("hidden.bs.modal", onHidden);
    };
  }, []);

  // Sort + filter
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = [...insects];

    list.sort((a, b) => {
      const av = a?.[order];
      const bv = b?.[order];
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av ?? "").localeCompare(String(bv ?? ""), "hu");
    });

    if (!q) return list;

    return list.filter((x) =>
      String(x?.[filterType] ?? "").toLowerCase().includes(q)
    );
  }, [insects, filter, filterType, order]);

  // Validate
  const validateModel = (m) => {
    if (!m.name?.trim()) return "Hibás adat: a Név kötelező.";
    if (!m.type) return "Hibás adat: a Típus kötelező.";
    if (!m.metamorphosis) return "Hibás adat: a Metamorfózis kötelező.";
    if (!m.role) return "Hibás adat: a Szerep kötelező.";
    if (!m.active_months?.trim()) return "Hibás adat: az Aktívitás mező kötelező.";
    const ul = Number(m.utility_level);
    if (!Number.isInteger(ul) || ul < 1 || ul > 5) return "Hibás adat: Hasznossági szint 1–5.";
    return null;
  };

  // Set new
  const setNew = () => {
    setIsNew(true);
    setModel({ ...emptyModel });
    hideOffcanvas();
    showModal();
  };

  // Set update
  const setEdit = (row) => {
    setIsNew(false);
    setModel({
      id: row.id,
      name: row.name ?? "",
      img: row.img ?? null,
      img_type: row.img_type ?? null,
      type: row.type ?? "",
      metamorphosis: row.metamorphosis ?? "",
      role: row.role ?? "",
      active_months: row.active_months ?? "",
      utility_level: row.utility_level ?? 1,
    });
    showModal();
  };

  // Cancel
  const onCancel = async () => {
    hideModal();
    setModel({ ...emptyModel });
    setIsNew(true);
    await load();
  };

  // Save
  const onSave = async () => {
    if (busy) return;
    const err = validateModel(model);
    if (err) return alert(err);

    if (!isNew) {
      if (!confirm("Biztosan ezt akarja?")) return;
    }

    setBusy(true);
    try {
      const payload = {
        name: model.name,
        img: model.img || null,
        img_type: model.img ? model.img_type : null,
        type: model.type,
        metamorphosis: model.metamorphosis,
        role: model.role,
        active_months: model.active_months,
        utility_level: Number(model.utility_level),
      };

      if (isNew) {
        const r = await api.post("/insects", payload);
        if (r.data?.ok) {
          await load();
          hideModal();
          alert("Adat felvétele sikerült!");
        } else {
          alert("Adat felvétele nem sikerült!");
        }
      } else {
        const r = await api.put(`/insects/${model.id}`, payload);
        const affected = r.data?.data?.affectedRows;
        if (affected) {
          await load();
          hideModal();
          alert("Adat módosítása sikerült!");
        } else {
          alert("Adat módosítása nem sikerült!");
        }
      }
    } catch (e) {
      const msg = e?.response?.data?.error || "nem elérhető szerver / validációs hiba";
      alert(`Sikertelen művelet: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  // Delete
  const onDelete = async (id) => {
    if (!confirm("Biztosan ezt akarja?")) return;
    if (busy) return;

    setBusy(true);
    try {
      const r = await api.delete(`/insects/${id}`);
      const affected = r.data?.data?.affectedRows;
      if (affected) {
        await load();
        alert("Adat törlése sikerült!");
      } else {
        alert("Adat törlése nem sikerült!");
      }
    } catch (e) {
      const msg = e?.response?.data?.error || "nem elérhető szerver";
      alert(`Sikertelen törlés: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  // Get image
  const onImagePick = (file) => {
    if (!file) return;

    if (!file.type?.toLowerCase().startsWith("image/")) {
      alert("Hibás fájltípus (csak kép).");
      return;
    }
    if (file.size > MAX_IMAGE_KB * 1024) {
      alert(`Hibás fájlméret (max ${MAX_IMAGE_KB}KB).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = String(e.target.result || "");
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : null;
      setModel((m) => ({
        ...m,
        img: base64,
        img_type: file.type,
      }));
    };
    reader.onerror = () => alert("Fájl beolvasási hiba.");
    reader.readAsDataURL(file);
  };

  // Clear image
  const clearImage = () => {
    setModel((m) => ({ ...m, img: null, img_type: null }));
  };

  // Show image
  const imgPreview = model.img
    ? `data:${model.img_type};base64,${model.img}`
    : null;

  const isFormValid = !validateModel(model);

  return (
    <>
      {/* Offcanvas (Top) */}
      <div className="offcanvas offcanvas-top" 
           tabIndex="-1" 
           id="offcanvasTop" 
           ref={offcanvasRef}>

        {/* Header */}
        <div className="offcanvas-header justify-content-end pb-1">

          {/* Title */}
          <h4 className="text-small-caps m-0">
            Rovarok
          </h4>

          {/* Close button */}
          <button type="button" 
                  className="btn-close text-reset me-3" 
                  data-bs-dismiss="offcanvas" 
                  aria-label="Close"></button>
        </div>

        {/* Body */}
        <div className="offcanvas-body py-0">

          {/* New button/Filter */}
          <div className="row justify-content-center">

            {/* New button */}
            <div className="col-12 col-sm-4 col-md-3 mb-3">
              <button type="button"
                      className="btn btn-primary w-auto shadow-sm-bottom-end btn-click-effect"
                      onClick={setNew}
                      disabled={busy}>
                <i className="fa-solid fa-circle-plus me-1"></i>
                Új tétel
              </button>
            </div>

            {/* Filter */}
            <div className="col-12 col-sm-8 col-md-9 mb-3">
              <form className="d-flex align-items-center">
                <label htmlFor="filter" className="form-label me-3 mt-1">
                  <i className="fa-solid fa-magnifying-glass fa-lg me-1"></i>
                  Keres:
                </label>
                <input  type="search"
                        className="form-control"
                        id="filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        spellCheck={false}
                        placeholder="keres"
                        autoComplete="off"
                        style={{ maxWidth: 680 }}/>
              </form>
            </div>
          </div>

          {/* Filter type */}
          <div className="row justify-content-start">
            <div className="col-12 col-sm-4 col-md-3 mb-3"></div>
            <div className="col-12 col-sm-8 col-md-9">
              <div className="form-label me-3 d-inline-block">
                <i className="fa-brands fa-sourcetree me-1"></i>
                Keresés forrása:
              </div>


              {Object.entries(filterKeys).map(([k, v]) => (
                <div className="form-check me-3 mb-3 text-nowrap d-inline-block" key={k}>
                  <input  className="form-check-input"
                          type="radio"
                          id={`ft_${k}`}
                          value={k}
                          name="filterType"
                          checked={filterType === k}
                          onChange={() => setFilterType(k)}/>
                  <label className="form-check-label" htmlFor={`ft_${k}`}>{v}</label>
                </div>
              ))}
            </div>
          </div>
          <hr/>

          {/* Order */}
          <div className="row justify-content-start">
            <div className="col-12 col-sm-4 col-md-3 mb-3 text-sm-end">
              <i className="fa-solid fa-arrow-down-up-across-line fa-lg me-1"></i>
              Rendezettség:
            </div>
            <div className="col-12 col-sm-8 col-md-9">
              {Object.entries(displayKeys).map(([k, v]) => (
                <div className="form-check me-3 mb-3 text-nowrap d-inline-block" key={k}>
                  <input  className="form-check-input"
                          type="radio"
                          id={`ord_${k}`}
                          value={k}
                          name="order"
                          checked={order === k}
                          onChange={() => { setOrder(k); hideOffcanvas(); }}/>
                  <label className="form-check-label" htmlFor={`ord_${k}`}>{v}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky-top px-3 py-1">
        <div className="container-fluid">
          <div className="row justify-content-end align-items-center">

            {/* Title */}
            <h4 className="d-inline-block w-auto mb-0 me-auto cursor-pointer text-small-caps"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Rovarok
            </h4>

            {/* Toggle theme */}
            <div className="w-auto p-0">
              <span className="p-2 rounded nav-item"
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                    title="Téma váltás">
                <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
              </span>
            </div>

            {/* Hamburger icon */}
            <div className="p-2 w-auto nav-item rounded">
              <button className="navbar-toggler w-auto" 
                      type="button" 
                      onClick={showOffcanvas} 
                      disabled={busy}>
                <i className="fa-solid fa-bars fa-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container">

        {/* Cards */}
        {filtered.length > 0 ? (
          <div className="row mt-2 mb-4 justify-content-center 
                          row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">

            {/* Card */}
            {filtered.map((x) => (
              <div className="col scale-in" 
                   key={x.id}>
                <div className="card shadow-sm-bottom-end">

                  {/* Body */}
                  <div className="card-body">
                    <div className="row mb-3 justify-content-center align-items-center">

                      {/* Image */}
                      <div  className="col-6 overflow-hidden border mb-2"
                            style={{
                              width: 200,
                              height: 200,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              backgroundImage: x.img ? 
                                              `url(data:${x.img_type};base64,${x.img})` : 
                                              "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                        {!x.img && <span className="text-muted">Nincs kép</span>}
                      </div>

                      {/* Name */}
                      <h5 className="col-6 card-title text-center">
                        {x.name}
                        </h5>
                    </div>

                    {/* Properties */}
                    {Object.entries(displayKeys).map(([k, label]) => (
                      k !== "name" && k !== "id" && (
                        <div className="row align-items-center" key={k}>
                          <h6 className="col-6 text-end m-0">{label}:</h6>
                          <p className="col-6 text-start m-0">{String(x?.[k] ?? "")}</p>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="card-footer text-end py-3">

                    {/* Update */}
                    <button type="button"
                            className="btn btn-warning mx-2 shadow-sm-bottom-end btn-click-effect"
                            onClick={() => setEdit(x)}
                            disabled={busy}>
                      <i className="fa-solid fa-file-pen me-1"></i>
                      Módosít
                    </button>

                    {/* Delete */}
                    <button type="button"
                            className="btn btn-danger mx-2 shadow-sm-bottom-end btn-click-effect"
                            onClick={() => onDelete(x.id)}
                            disabled={busy}>
                      <i className="fa-solid fa-circle-minus me-1"></i>
                      Töröl
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (

          // Empty
          <div className="row mt-4">
            <h6 className="display-6 text-center">Nincs adat!</h6>
          </div>
        )}
      </main>

      {/* Modal */}
      <div className="modal fade" 
           id="formModal" 
           tabIndex="-1" 
           aria-hidden="true" 
           ref={modalRef}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">

            {/* Header */}
            <div className="modal-header">
              <h1 className="modal-title fs-5">
                {isNew ? "Új tétel" : "Módosít"}
              </h1>
              <button type="button" 
                      className="btn-close" 
                      onClick={onCancel} 
                      aria-label="Close" />
            </div>

            {/* Body */}
            <div className="modal-body">

              {/* Form */}
              <form onSubmit={(e) => e.preventDefault()}>

                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Név:</label>
                  <input  type="text"
                          className="form-control"
                          id="name"
                          value={model.name}
                          onChange={(e) => setModel((m) => ({ ...m, name: e.target.value }))}
                          autoComplete="off"
                          spellCheck={false}
                          required/>
                </div>

                {/* Image */}
                <div className="mb-3 d-flex align-items-center">
                  <input  id="image"
                          type="file"
                          accept="image/*"
                          className="form-control d-none"
                          onChange={(e) => onImagePick(e.target.files?.[0])}/>
                  <label htmlFor="image" style={{ margin: 0 }}>
                    <div  className="overflow-hidden border d-flex 
                                     align-items-center justify-content-center"
                          style={{
                            width: 100,
                            height: 100,
                            cursor: busy ? "not-allowed" : "pointer",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundImage: imgPreview ? `url(${imgPreview})` : "none",
                            opacity: busy ? 0.6 : 1,
                          }}
                          title="Kép kiválasztása">
                      {
                        !model.img && 
                        <span className="text-center text-muted small">
                          Max: 64KB
                        </span>
                      }
                    </div>
                  </label>

                  {model.img && (
                    <div  className="ms-3 fw-bold text-primary"
                          style={{ cursor: busy ? "not-allowed" : "pointer" }}
                          onClick={() => !busy && clearImage()}
                          title="Kép törlése">
                      x
                    </div>
                  )}
                </div>

                {/* Type */}
                <div className="mb-3">
                  <label htmlFor="type" className="form-label">Típus:</label>
                  <select className="form-select"
                          id="type"
                          value={model.type}
                          onChange={(e) => setModel((m) => ({ ...m, type: e.target.value }))}
                          required>
                    <option value="" disabled hidden>-- kérem válasszon --</option>
                    {options.type.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>

                {/* Metamorphosis */}
                <div className="mb-3">
                  <label htmlFor="metamorphosis" className="form-label">Metamorfózis:</label>
                  <select className="form-select"
                          id="metamorphosis"
                          value={model.metamorphosis}
                          onChange={(e) => setModel((m) => ({
                            ...m, metamorphosis: e.target.value 
                          }))}
                          required>
                    <option value="" disabled hidden>-- kérem válasszon --</option>
                    {options.metamorphosis.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>

                {/* Role */}
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Szerep:</label>
                  <select className="form-select"
                          id="role"
                          value={model.role}
                          onChange={(e) => setModel((m) => ({ ...m, role: e.target.value }))}
                          required>
                    <option value="" disabled hidden>-- kérem válasszon --</option>
                    {options.role.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>

                {/* Active months */}
                <div className="mb-3">
                  <label htmlFor="active_months" 
                         className="form-label">
                    Aktívitás hónap(ok):
                  </label>
                  <input  type="text"
                          className="form-control"
                          id="active_months"
                          value={model.active_months}
                          onChange={(e) => setModel((m) => ({ 
                            ...m, active_months: e.target.value 
                          }))}
                          autoComplete="off"
                          spellCheck={false}
                          required/>
                </div>

                {/* Utility level */}
                <div className="mb-4">
                  <label htmlFor="utility_level" 
                         className="form-label">
                    Hasznossági szint (1-5):
                  </label>
                  <input  type="number"
                          className="form-control"
                          id="utility_level"
                          min="1"
                          max="5"
                          value={model.utility_level}
                          onChange={(e) => setModel((m) => ({ 
                            ...m, utility_level: e.target.value 
                          }))}
                          required/>
                </div>

                {/* Buttons */}
                <div className="text-end">

                  {/* Cancel */}
                  <button type="button"
                          className="btn btn-secondary mx-1 shadow-sm-bottom-end btn-click-effect"
                          onClick={onCancel}
                          disabled={busy}>
                    <i className="fa-solid fa-circle-xmark me-1"></i>
                    Mégsem
                  </button>

                  {/* Save */}
                  <button type="button"
                          className="btn btn-primary mx-1 shadow-sm-bottom-end btn-click-effect"
                          onClick={onSave}
                          disabled={busy || !isFormValid}>
                    <i className="fa-solid fa-floppy-disk me-1"></i>
                    Mentés
                  </button>
                </div>

                {/* Busy jelzés */}
                {busy && (
                  <div className="mt-3 small text-muted">
                    Folyamatban...
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
