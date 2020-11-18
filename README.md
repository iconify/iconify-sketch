# Iconify plug-in for Sketch

Want to add icons to your designs?

Iconify for Sketch got you covered. One plug-in offers over 70,000 icons from 80+ icon sets, including Material Design Icons, FontAwesome, Jam Icons, Open Emoji and many others.

You can:

-   Browse icon sets.
-   Search icon sets.
-   Import any icon as vector shape to Sketch document.

It is completely free! All icon sets offered with Iconify are available with open source licenses.

## What is Iconify?

Iconify is an open source platform for working with icons.

Originally it was designed to replace outdated icon fonts with modern SVG framework. Now it is a much bigger project. Iconify offers:

-   Plugins for design tools, such as this plug-in for Sketch.
-   [SVG framework](https://iconify.design/) to easily embed icons in HTML.
-   [React, Vue and Svelte components](https://docs.iconify.design/implementations/components/) for developers that prefer to use components instead of SVG framework.
-   [Icon picker](http://github.com/iconify/icon-finder), allowing developers to add icon search functionality to applications, such as website builders.

## Installation

Click ["Releases"](https://github.com/iconify/iconify-sketch/releases) link, download the latest file, unpack it, open `iconify.sketchplugin` in Finder. Finder should launch Sketch that should install this plug-in.

If plug-in installation fails, copy `iconify.sketchplugin` to `~/Library/Application Support/com.bohemiancoding.sketch3/Plugins/`.

## Usage

In Sketch menu select Plug-ins -> Iconify

or press Ctrl+Shift+I

Browse or search icons, select any icon, click "Import" button. Plug-in will import icon to your current project.

## Screenshots

Importing icon:
![Iconify for Sketch: footer](https://docs.iconify.design/assets/images/plugins/sketch_footer.png)

Big choice of "home" icons:
![Iconify for Sketch: search results](https://docs.iconify.design/assets/images/plugins/sketch_home_grid.png)

Collections list:
![Iconify for Sketch: browse collections](https://docs.iconify.design/assets/images/plugins/sketch_index.png)
![Iconify for Sketch: browse collections](https://docs.iconify.design/assets/images/plugins/sketch_emoji.png)

Importing multiple icons:
![Iconify for Sketch: browsing icons set](https://docs.iconify.design/assets/images/plugins/sketch_select_multiple.png)

## Building

If you want to build plug-in from source code, follow these steps:

-   Download this repository.
-   Run `npm install` to install all dependencies.
-   Run `npm run build` to build plug-in.

Build process will generate `iconify.sketchplugin` that you can install in Sketch.

## License

MIT. See license.txt

This license does not apply to icons. Icons are released under different licenses, see each icons set for details.

Icons available by default are all licensed under some kind of open source or free license.

© 2019, 2020 Vjacheslav Trushkin
