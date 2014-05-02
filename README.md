CS171-Final-Project
===================


Here is Bikes on Parade!! A visualization system for comparing bikeshare systems across three different American cities.


The files "bikes2.js" is the workhorse of our system. It references various datasets (combo_stats.json, bos_map_weekday_stats.json, dc_map_weekday_stats.json, chi_map_weekday_stats.json) we use to generate what you see on the page. The code contained in bikes2 is original, however it employs several libraries including Leaflet, a custom points layer script for Leaflet (linked below), and, of course, D3. Other files are largely differently shaped datasets which other developers might find useful but were not ultimately invoked in this project.


Our project lives on https://www.everlane12.github.io/CS171-Final-Project, where you can also see our screencast.


The interface is fairly straightforward. There are two sets of toggles at the top and one set of toggles right above the map. Also, don't forget to brush the miniature overview line graph! That's pretty much it. Enjoy, learn.