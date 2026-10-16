// Units converter data and logic
(function () {
  // Each category: units object maps unit key -> { label, to(x), from(x) }
  // For linear conversions, define factor to a base unit.
  function linear(label, factorToBase) {
    return {
      label,
      to: (v) => v * factorToBase,
      from: (v) => v / factorToBase,
    };
  }

  const CATEGORIES = {
    length: {
      label: 'Length',
      units: {
        m: linear('Meter (m)', 1),
        km: linear('Kilometer (km)', 1000),
        cm: linear('Centimeter (cm)', 0.01),
        mm: linear('Millimeter (mm)', 0.001),
        mi: linear('Mile (mi)', 1609.344),
        yd: linear('Yard (yd)', 0.9144),
        ft: linear('Foot (ft)', 0.3048),
        in: linear('Inch (in)', 0.0254),
        nmi: linear('Nautical mile', 1852),
      },
    },
    mass: {
      label: 'Mass',
      units: {
        kg: linear('Kilogram (kg)', 1),
        g: linear('Gram (g)', 0.001),
        mg: linear('Milligram (mg)', 0.000001),
        lb: linear('Pound (lb)', 0.45359237),
        oz: linear('Ounce (oz)', 0.028349523125),
        t: linear('Metric ton (t)', 1000),
        st: linear('Stone (st)', 6.35029318),
      },
    },
    temperature: {
      label: 'Temperature',
      units: {
        c: { label: 'Celsius (°C)', to: (v) => v, from: (v) => v },
        f: {
          label: 'Fahrenheit (°F)',
          to: (v) => (v - 32) * (5 / 9),
          from: (v) => v * (9 / 5) + 32,
        },
        k: { label: 'Kelvin (K)', to: (v) => v - 273.15, from: (v) => v + 273.15 },
      },
    },
    volume: {
      label: 'Volume',
      units: {
        l: linear('Liter (L)', 1),
        ml: linear('Milliliter (mL)', 0.001),
        m3: linear('Cubic meter (m³)', 1000),
        gal: linear('US gallon', 3.785411784),
        qt: linear('US quart', 0.946352946),
        pt: linear('US pint', 0.473176473),
        cup: linear('US cup', 0.2365882365),
        floz: linear('US fl oz', 0.0295735295625),
        tbsp: linear('Tablespoon', 0.01478676478125),
        tsp: linear('Teaspoon', 0.00492892159375),
      },
    },
    area: {
      label: 'Area',
      units: {
        m2: linear('Square meter (m²)', 1),
        km2: linear('Square km (km²)', 1_000_000),
        cm2: linear('Square cm (cm²)', 0.0001),
        ha: linear('Hectare (ha)', 10_000),
        ft2: linear('Square ft (ft²)', 0.09290304),
        in2: linear('Square in (in²)', 0.00064516),
        yd2: linear('Square yd (yd²)', 0.83612736),
        ac: linear('Acre (ac)', 4046.8564224),
        mi2: linear('Square mile (mi²)', 2_589_988.110336),
      },
    },
    time: {
      label: 'Time',
      units: {
        s: linear('Second (s)', 1),
        ms: linear('Millisecond (ms)', 0.001),
        min: linear('Minute (min)', 60),
        h: linear('Hour (h)', 3600),
        d: linear('Day (d)', 86400),
        wk: linear('Week (wk)', 604800),
        mo: linear('Month (avg)', 2629800),
        yr: linear('Year (avg)', 31557600),
      },
    },
    speed: {
      label: 'Speed',
      units: {
        mps: linear('Meter/s (m/s)', 1),
        kph: linear('Kilometer/h (km/h)', 1 / 3.6),
        mph: linear('Mile/h (mph)', 0.44704),
        fps: linear('Foot/s (ft/s)', 0.3048),
        kn: linear('Knot', 0.514444),
      },
    },
    data: {
      label: 'Data',
      units: {
        b: linear('Byte (B)', 1),
        kb: linear('Kilobyte (KB)', 1000),
        mb: linear('Megabyte (MB)', 1_000_000),
        gb: linear('Gigabyte (GB)', 1_000_000_000),
        tb: linear('Terabyte (TB)', 1_000_000_000_000),
        kib: linear('Kibibyte (KiB)', 1024),
        mib: linear('Mebibyte (MiB)', 1024 * 1024),
        gib: linear('Gibibyte (GiB)', 1024 ** 3),
        tib: linear('Tebibyte (TiB)', 1024 ** 4),
        bit: linear('Bit', 0.125),
      },
    },
    energy: {
      label: 'Energy',
      units: {
        j: linear('Joule (J)', 1),
        kj: linear('Kilojoule (kJ)', 1000),
        cal: linear('Calorie (cal)', 4.184),
        kcal: linear('Kilocalorie (kcal)', 4184),
        wh: linear('Watt-hour (Wh)', 3600),
        kwh: linear('Kilowatt-hour (kWh)', 3_600_000),
        btu: linear('BTU', 1055.05585262),
        ev: linear('Electronvolt (eV)', 1.602176634e-19),
      },
    },
    angle: {
      label: 'Angle',
      units: {
        deg: linear('Degree (°)', 1),
        rad: linear('Radian', 180 / Math.PI),
        grad: linear('Gradian', 0.9),
        turn: linear('Turn', 360),
      },
    },
  };

  // Default from/to pair per category
  const DEFAULT_PAIRS = {
    length: ['m', 'ft'],
    mass: ['kg', 'lb'],
    temperature: ['c', 'f'],
    volume: ['l', 'gal'],
    area: ['m2', 'ft2'],
    time: ['h', 'min'],
    speed: ['kph', 'mph'],
    data: ['mb', 'mib'],
    energy: ['j', 'cal'],
    angle: ['deg', 'rad'],
  };

  function formatValue(v) {
    if (!isFinite(v)) return '';
    const abs = Math.abs(v);
    if (abs !== 0 && (abs < 1e-6 || abs >= 1e12)) {
      return v.toExponential(6).replace(/\.?0+e/, 'e');
    }
    let s = v.toPrecision(10);
    if (s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, '');
    return s;
  }

  function convert(categoryId, fromKey, toKey, value) {
    const cat = CATEGORIES[categoryId];
    if (!cat) return NaN;
    const from = cat.units[fromKey];
    const to = cat.units[toKey];
    if (!from || !to) return NaN;
    const base = from.to(value);
    return to.from(base);
  }

  function init() {
    const catSel = document.getElementById('conv-category');
    const fromSel = document.getElementById('conv-from');
    const toSel = document.getElementById('conv-to');
    const fromInput = document.getElementById('conv-from-input');
    const toInput = document.getElementById('conv-to-input');
    const swapBtn = document.getElementById('conv-swap');
    if (!catSel) return;

    for (const [id, cat] of Object.entries(CATEGORIES)) {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = cat.label;
      catSel.appendChild(opt);
    }

    function populateUnits(catId) {
      fromSel.innerHTML = '';
      toSel.innerHTML = '';
      const cat = CATEGORIES[catId];
      for (const [k, u] of Object.entries(cat.units)) {
        const o1 = document.createElement('option');
        o1.value = k; o1.textContent = u.label; fromSel.appendChild(o1);
        const o2 = document.createElement('option');
        o2.value = k; o2.textContent = u.label; toSel.appendChild(o2);
      }
      const pair = DEFAULT_PAIRS[catId] || Object.keys(cat.units);
      fromSel.value = pair[0];
      toSel.value = pair[1] || pair[0];
    }

    function recomputeFromLeft() {
      const v = parseFloat(fromInput.value);
      if (isNaN(v)) { toInput.value = ''; return; }
      const r = convert(catSel.value, fromSel.value, toSel.value, v);
      toInput.value = formatValue(r);
    }

    function recomputeFromRight() {
      const v = parseFloat(toInput.value);
      if (isNaN(v)) { fromInput.value = ''; return; }
      const r = convert(catSel.value, toSel.value, fromSel.value, v);
      fromInput.value = formatValue(r);
    }

    catSel.addEventListener('change', () => {
      populateUnits(catSel.value);
      if (fromInput.value === '') fromInput.value = '1';
      recomputeFromLeft();
    });
    fromSel.addEventListener('change', recomputeFromLeft);
    toSel.addEventListener('change', recomputeFromLeft);
    fromInput.addEventListener('input', recomputeFromLeft);
    toInput.addEventListener('input', recomputeFromRight);
    swapBtn.addEventListener('click', () => {
      const a = fromSel.value, b = toSel.value;
      fromSel.value = b; toSel.value = a;
      recomputeFromLeft();
    });

    catSel.value = 'length';
    populateUnits('length');
    fromInput.value = '1';
    recomputeFromLeft();
  }

  window.Units = { init, CATEGORIES, convert };
})();
