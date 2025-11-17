---
title: "Easy color theme management with CSS variables"
type: "entry"
date: "2025-11-17T16:42:03.897Z"
featured_image: null
featured_image_alt: null
tags: ["web development", "css", "resilient web dev"]
---

## Intro

For a long time I used [Sass](https://sass-lang.com/) in conjunction with a bundler like [Webpack](https://webpack.js.org/) in order to make up for CSS' shortcomings, the most important of which (for me) was the ability to assign and use *variables*, or, as CSS calls them - [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/--*).

You generally assign these to your `:root` selector so they are available throughout the rest of your CSS:
```CSS
:root {
  --color1: #f00;
}
```
You can also assign them to more specific selectors for... greater specificity as needed.
After the variables are assigned, you can use them as values in your CSS like so:

```CSS
#something {
  color: var(--color1);
}
```

You can override them down the line too! Just speaking about colors here, this gives us a few benefits:
- Your code is more maintainable - you can change your color variable, and it instantly affects any place where you've used that color
- You keep the numbers of colors on your site limited, which leads to consistent visual theme
- You can support a user's preference for 'Light mode', 'Dark mode', and contrast preference, by overriding these colors in [`@media` queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using)
  - for colors, these media queries are `prefers-color-scheme` and `prefers-contrast` - both can be set in your operating system settings, see my [/accessibility](/accessibility) page for instructions!

I chose to ~steal~ use the [Gruvbox color scheme](https://github.com/morhetz/gruvbox?tab=readme-ov-file) for my CSS colors as I find it appealing, I use it for my code editor ([NeoVim](https://neovim.io/)), and it meets the [WCAG 2.0 AA spec for contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) (for large and small text) :)

## Example

This is an abridged example, pulled from my CSS:

### Define Variables

I start with my preferred colors, no media queries applied:

```CSS
:root {
  --fg: #fbf1c7;
  --bg: #282828;
  --gray-low: #3c3836;
  --gray-high: #ebdbb2;
  --blue: #83a598;
  --blue-low: #076678;
  --purple: #d3869b;
  --purple-low: #8f3f71;
  --orange: #fe8019;
  --orange-low: #af3a03;

  /* Then, I add additional variables that will be
  used to override these base-colors later, based
  on the user's preferences */
  --dark-fg: #fbf1c7;
  --dark-bg: #282828;
  --dark-gray-low: #3c3836;
  --dark-gray-high: #ebdbb2;
  --dark-blue: #83a598;
  --dark-blue-low: #076678;
  --dark-purple: #d3869b;
  --dark-purple-low: #8f3f71;
  --dark-orange: #fe8019;
  --dark-orange-low: #af3a03;

  --light-fg: #282828;
  --light-bg: #fbf1c7;
  --light-gray-low: #d5c4a1;
  --light-gray-high: #504945;
  --light-blue: #076678;
  --light-blue-low: #83a598;
  --light-purple: #8f3f71;
  --light-purple-low: #b16286;
  --light-orange: #d65d0e;
  --light-orange-low: #fe8019;

  /* And even more color variables for when the
  user has `prefers-contrast: more` set - this lets
  us respect their light/dark theme choice, in
  conjunction with their high contrast preference. */
  --high-contrast-dark-fg: #fff;
  --high-contrast-dark-bg: #000;
  --high-contrast-dark-gray-low: #888;
  --high-contrast-dark-gray-high: #888;
  --high-contrast-dark-blue: #aaf;
  --high-contrast-dark-blue-low: #22f;
  --high-contrast-dark-purple: #f8f;
  --high-contrast-dark-purple-low: #d6d;
  --high-contrast-dark-orange: #f84;
  --high-contrast-dark-orange-low: #f8f;

  --high-contrast-light-fg: #000;
  --high-contrast-light-bg: #fff;
  --high-contrast-light-gray-low: #888;
  --high-contrast-light-gray-high: #888;
  --high-contrast-light-blue: #00d;
  --high-contrast-light-blue-low: #bbf;
  --high-contrast-light-purple: #40a;
  --high-contrast-light-purple-low: #208;
  --high-contrast-light-orange: #f40;
  --high-contrast-light-orange-low: #f40;
}
```
### Override Base Variables
First, decide on which theme you prefer for users who haven't set a dark or light-theme preference in their OS settings. Personally, I like the way this site looks better in dark.

With that decided, we can omit the `prefers-color-scheme: dark` (or `light`) `@media` queries because they're already in our base color variables.

So for `dark`-preferring users, we only have to check for the high-contrast-preferring users, and override the color variables with the `high-contrast-dark` variables
```CSS
@media (prefers-contrast: more) {
  :root {
    --fg: var(--high-contrast-dark-fg);
    --bg: var(--high-contrast-dark-bg);
    --gray-low: var(--high-contrast-dark-gray-low);
    --gray-high: var(--high-contrast-dark-gray-high);
    --blue: var(--high-contrast-dark-blue);
    --blue-low: var(--high-contrast-dark-blue-low);
    --purple: var(--high-contrast-dark-purple);
    --purple-low: var(--high-contrast-dark-purple-low);
    --orange: var(--high-contrast-dark-orange);
    --orange-low: var(--high-contrast-dark-orange-low);
  }
}
```

For `light`, we override the base variables in `@media` queries based on their preferences
```CSS
@media (prefers-color-scheme: light) {
  :root {
    --fg: var(--light-fg);
    --bg: var(--light-bg);
    --gray-low: var(--light-gray-low);
    --gray-high: var(--light-gray-high);
    --blue: var(--light-blue);
    --blue-low: var(--light-blue-low);
    --purple: var(--light-purple);
    --purple-low: var(--light-purple-low);
    --orange: var(--light-orange);
    --orange-low: var(--light-orange-low);
  }
}
```
Then, the combination `@media` queries for light + more contrast
```CSS
@media (prefers-color-scheme: light) and (prefers-contrast: more) {
  :root{
    --fg: var(--high-contrast-light-fg);
    --bg: var(--high-contrast-light-bg);
    --gray-low: var(--high-contrast-light-gray-low);
    --gray-high: var(--high-contrast-light-gray-high);
    --blue: var(--high-contrast-light-blue);
    --blue-low: var(--high-contrast-light-blue-low);
    --purple: var(--high-contrast-light-purple);
    --purple-low: var(--high-contrast-light-purple-low);
    --orange: var(--high-contrast-light-orange);
    --orange-low: var(--high-contrast-light-orange-low);
    }
}
```
So that's about it! If you want to see how this looks on my site - click the 'gear' icon i have in my navigation menu, and try out the various combinations.

Part of why I started this site was to make it a playground for trying out all the new things widely supported by modern web browsers - I'm making a point to use only browser technologies - no frameworks or build tools.

Quick shout to the [CSSWG](https://wiki.csswg.org/), [W3C](https://www.w3.org/), and [TC39](https://tc39.es/) for their work on these new web technologies and the browser teams working on Firefox, Safari, and even Chrome (though their parent company can eat a `[REDACTED]`). Y'all are doing great work.

Thanks for reading!
