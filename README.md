# HOMY Premium Real Estate — website

A complete 6-page website. Plain HTML, CSS and JavaScript. No software to
install, no server, no database. Just files in a folder.

---

## 1. How to look at the site on your computer

**Double-click `index.html`.** It opens in your usual browser. That's it.

Everything works this way: the menu, the filters, the property pages, the
French/English switch, the WhatsApp button.

---

## 2. How to put the site online

1. Go to **https://app.netlify.com/drop**
2. Drag the whole `Homy` folder onto the page.
3. Wait about twenty seconds. You get a web address you can share straight away.

To connect your own domain name (for example `homy.ma`), open **Domain
settings** in Netlify and follow the steps there.

Whenever you change something, drag the folder onto Netlify Drop again to
publish the new version.

---

## 3. The three files you will actually edit

Everything you're likely to change lives in three files. Open them with any
plain text editor (Notepad on Windows, TextEdit on Mac, or the free
[VS Code](https://code.visualstudio.com/)).

### `listings.json` — your properties

One block of text per property, between `{` and `}`. To change a price, find
`"price": 8900000` and type a different number. To change a photo, replace the
web address between the quotes.

Rules that matter:

- Keep every `"quote mark"` and every `,` comma exactly where they are.
- Prices are plain numbers — no spaces, no "MAD", no decimals.
- `"status"` is either `"sale"` or `"rent"`.
- `"type"` is `"apartment"`, `"villa"`, `"penthouse"` or `"riad"`.
- `"city"` is `"casablanca"` or `"marrakech"`.
- `"featured": true` puts a property on the home page. Six is the right number.
- `"id"` is what appears in the web address of the property page. If you change
  it, any old link to that property stops working.
- Every property has a French **and** an English version of its title,
  description, neighbourhood text and finishes.

If the site ever shows no properties at all, a comma or a quote mark is
missing. Paste the file into **https://jsonlint.com** — it points at the exact
line.

### `js/config.js` — your phone numbers and address

Phone, WhatsApp, email, office address, opening hours, social links. Change
them once here and they update on every page.

The WhatsApp number is digits only, with the country code and no leading zero:
`06 61 23 45 67` becomes `212661234567`.

### `js/i18n.js` — every word on the site

All the text of the site, French on the left, English on the right. Change the
words between the quotes; leave the name on the left alone.

---

## 4. Photos

The photos are free stock images loaded from the internet, there only as
placeholders. Replace them with your own.

**The easy way:** put your photos in the `img` folder and, in `listings.json`,
write `"img/villa-anfa-1.jpg"` instead of the long `https://...` address.

Two things worth doing before you upload a photo:

- Resize it to about **1600 pixels wide**. Bigger files make the site slow.
- Save as JPG at good-but-not-maximum quality.

If a photo is ever missing or misspelled, the site shows an elegant HOMY
placeholder instead of a broken image.

---

## 5. What is in the folder

```
index.html          Home page
proprietes.html     All properties, with filters
propriete.html      One property (the same page serves all of them)
a-propos.html       About / the founder
investir.html       Investment guide
contact.html        Contact page
404.html            Shown if someone follows a broken link

listings.json       ← YOUR PROPERTIES

css/style.css       All the design

js/config.js        ← YOUR PHONE, EMAIL, ADDRESS
js/i18n.js          ← ALL THE TEXT, FRENCH AND ENGLISH
js/app.js           Menu, language switch, animations, WhatsApp button
js/pages.js         Property cards, filters, photo gallery, contact form
js/data.js          Reads listings.json
js/listings-backup.js   See the note below

img/placeholder.svg Shown if a photo is missing

robots.txt          Tells Google it may index the site
sitemap.xml         Lists the pages for Google — update the domain
_headers            Makes repeat visits faster (Netlify reads it)
```

### The note about `js/listings-backup.js`

Browsers refuse to let a page read a `.json` file when you open the HTML
straight from your computer — a security rule, nothing we can change. So the
site keeps a copy of the properties in `js/listings-backup.js` purely so the
double-click preview works.

**The live website always reads `listings.json`.** Edit that one. If you also
want your double-click preview to show the change, paste the same content into
`js/listings-backup.js` between the brackets — or just publish to Netlify and
look at it there, which is simpler.

---

## 6. Before you go live

- [ ] Real phone numbers and email in `js/config.js`
- [ ] Real office address, and check the map on the contact page
- [ ] Real WhatsApp number
- [ ] Your own property photos and text in `listings.json`
- [ ] The founder photo on the home page and About page (`index.html` and
      `a-propos.html`, search for `founder__media`)
- [ ] The credentials list on the About page — currently placeholder text, it
      needs your actual legal information
- [ ] The figures on the Investment page are market estimates for illustration;
      have them checked before publishing them as advice

- [ ] Replace `www.homy.ma` with your real domain in `sitemap.xml` and
      `robots.txt` once the domain is connected

### How the contact form works

Once the site is published on Netlify, messages arrive **in your inbox
automatically**. There is nothing to set up — Netlify recognises the form on
its own. You'll find every message under **Forms** in your Netlify dashboard,
and you can add the email address that should be notified there.

If someone fills the form while looking at the files on their own computer,
where there is no Netlify to receive it, the site quietly falls back to opening
their email program with the message already written. Either way the message
reaches you.
