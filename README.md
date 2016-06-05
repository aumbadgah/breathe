
# breathe

Deep breathing assistant

Dependencies
- npm
- gulp

Utilizes
- widgets and shared state based architecture
- livereload for more efficient dev workflow
- browserify for module based application
- babel for es6
- cookies for color theme storage
- ga for analytics
- bitly for tiny urls
- fb sdk and whatsapp urls for social functionalities

The application is currently fully independent of any backend, the cost of which is the need to declare all third party application ids and user names in the browser application configuration.


##### Build and watch

Run dev

``` NODE_ENV=dev gulp ```

Run prod (minified)

``` gulp ```


##### Todo

- Utilize Theme class fully. Currently ThemeList and MultiColorPicker utilize object literals rather than class instances

- Minimize MultiColorPicker foot print by using a single on-demand instace of ColorPicker

- Implement a widget for text content, dependency to content serving backend

- Implement an optional backend application as a wrapper for bitly account information
