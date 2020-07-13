document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
            left: 'today prev,next ',
            center: 'title',
            right: 'dayGridMonth,listYear',
        },

        themeSystem: 'standard',
        displayEventTime: true,
        eventColor: '#F09300',


        // API KEY
        googleCalendarApiKey: 'AIzaSyAlERdHK-QuZ16KCTgKAwL368mGVLoEzrs',

        // Academy of American Studies Calendar
        events: {
            googleCalendarId: '6omfgn5m3vscfab3qs9pgj7308@group.calendar.google.com',
        },

        eventClick: function (arg) {
            // opens events in a popup window
            window.open(arg.event.url, 'google-calendar-event', 'width=700,height=600');

            arg.jsEvent.preventDefault() // don't navigate in main tab
        },

        loading: function (bool) {
            document.getElementById('loading').style.display =
                bool ? 'block' : 'none';
        }

    });

    calendar.render();
});