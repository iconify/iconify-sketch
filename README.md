# Iconify plug-in for Sketch

Import Material Design Icons, FontAwesome, Jam Icons, EmojiOne, Twitter Emoji and many other icons (more than 50 icon sets containing over 30,000 icons) to Sketch document as vector shapes.

## What is Iconify?

Iconify is new unified SVG framework. It is designed to replace outdated glyph fonts with modern JavaScript SVG framework
and offer massive choice of icons. Unlike fonts, Iconify only loads icons used on pages, so you can use icons from FontAwesome,
Material Design Icons, Firefox Emoji and more on web page without loading many fonts. It is fast and very easy to use.

See [https://iconify.design/](https://iconify.design/) for details.

In addition to SVG framework, Iconify is available as React component (components for other frameworks will be available later). See [https://github.com/iconify-design/iconify-react](https://github.com/iconify-design/iconify-react)

## What can Sketch plug-in do?

Sketch plug-in offers easy way to import icons to project.

You can browse and search icon sets directly from Sketch. No need to copy/paste icons - plug-in will import icons you select.

Also this plugin inserts SVG in Sketch document exactly same way as icons are shown on pages. Icons include extra layer that
matches viewBox, so you can resize and place icon correctly in your design and then in HTML document with same dimensions
it will look the same.

## Installation

Click ["Releases"](https://github.com/iconify-design/iconify-sketch/releases) link, download latest file, unpack it, open "iconify.sketchplugin" in Finder. Finder should launch Sketch that should install this plug-in.

If plug-in installation fails, copy iconify.sketchplugin to ~/Library/Application Support/com.bohemiancoding.sketch3/Plugins/

## Usage

In Sketch menu select Plug-ins -> Iconify
or press Ctrl+Shift+I

Browse or search icons, select any icon, click "Add" button. Plug-in will import icon to your current project.

## TODO

* [ ] Possibility to use layer styles, though it could be tricky with shapes that have opacity or stroke
* [ ] Add options: import icons with original dimensions, reset selection

## Screenshots

Big choice of "home" icons:
![Iconify for React - search results](https://iconify.design/assets/images/sketch-sample-00.png)

Browsing Emoji One icons:
![Iconify for React - browsing icons set](https://iconify.design/assets/images/sketch-sample-01.png)

Collections list:
![Iconify for React - browse collections](https://iconify.design/assets/images/sketch-sample-02.png)


## License

MIT. See license.txt

This license does not apply to icons. Icons are released under different licenses, see each icons set for details.
Icons available by default are all licensed under some kind of open source or free license.

© 2019 Vjacheslav Trushkin
