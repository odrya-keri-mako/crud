;(function(window, angular) {

  'use strict';

  // Application module
  angular.module('app', [
    'ui.router',
    'app.common'
  ])

  // Application config
  .config([
    '$stateProvider', 
    '$urlRouterProvider', 
    function($stateProvider, $urlRouterProvider) {

      $stateProvider
			.state('insects', {
				url: '/insects',
				templateUrl: './html/insects.html',
				controller: 'insectsController'
			});

    $urlRouterProvider.otherwise('/insects');
    }
  ])

  // Application run
  .run([
    '$rootScope',
    function($rootScope) {

      // Get page identifier
      let location = window.location.pathname.toLowerCase();
      if (location.charAt(0) === '/') location = location.slice(1);
      if (location.slice(-1) === '/') location = location.slice(0, -1);
      $rootScope.pageID = location.replaceAll('/', '-') + '-';

      // Get last theme
      const theme = localStorage.getItem($rootScope.pageID + "theme");
      $rootScope.theme = theme ?? "dark";
    }
  ])

  // Insects controller
  .controller('insectsController', [
    '$rootScope',
    '$scope',
    '$timeout',
    '$window',
    'http',
    'util',
    function($rootScope, $scope, $timeout, $window, http, util) {

      // Set local methods
      const methods = {

        // Initialize
        init: () => {

          // Set api base path
          $scope.apiBase = '../../backend/php/';

          // Set helper
          $scope.helper = {

            // Model
            model: {
              name: null,
              image: null,
              img: null,
              img_type: null,
              type: null,
              metamorphosis: null,
              role: null,
              active_months: null,
              utility_level: 1
            },
            
            // Típus
            type: [ 
              "Bogarak", // katicabogár, szarvasbogár, cserebogár...
              "Lepkék", // nappali pávaszem, bogáncslepke, selyemlepke...
              "Hártyásszárnyúak", // méhek, darazsak, hangyák...
              "Kétszárnyúak", // legyek, szúnyogok, böglyök...
              "Poloskák", // bencepoloska, ágyipoloska...
              "Egyenesszárnyúak", // sáskák, tücskök, szöcskék...
              "Szitakötők", // barna óriásacsa, kisasszöke...
              "Botsáskák", // bengáli botsáska...
              "Csótányok", // barlangi óriáscsótány...
            ],

            // Metamorfózis
            metamorphosis: [
              "Nincs",
              "Részleges",
              "Teljes"
            ],

            // Szerep
            role: [
              "Beporzás",
              "Lebontás",
              "Tápláléklánc",
              "Kártevőirtás",
              "Talajképzés",
              "Kártevő"
            ],

            // Keys
            keys: {
              id: "Azonosító",
              name: "Név",
              type: "Típus",
              metamorphosis: "Metamorfózis",
              role: "Szerep",
              active_months: "Aktívitás",
              utility_level: "Hasznossági szint"
            },

            // Filter
            filter: null,

            // Filter type
            filterType: "name",

            // Order
            order: 'id',

            // New/Update
            isNew: false,

            // Offcanvas
            offcanvas: null
          };

          // Get data
          methods.get();

          // Offcanvas initialize
          methods.offcanvasInit();
        },

        // Events
        events: () => {
          const appWindow = angular.element($window);
          appWindow.bind('resize', () => {
            methods.offcanvasClose();
          });
        },

        // Get data
        get: () => {
          http.request(`${$scope.apiBase}insects_get.php`)
          .then(response => {
            $scope.insects = response;
            $scope.$applyAsync();
          })
          .catch(e => console.log(e));
        },

        // Create new data
        post: (data) => {
          http.request({
            url: `${$scope.apiBase}insect_post.php`,
            data: data
          })
          .then(response => {
            if (response.affectedRows) {
              methods.get();
              $timeout(() => {
                alert("Adat felvétele sikerült!");
              }, 300);
            } else alert("Adat felvétele nem sikerült!");
          })
          .catch(e => console.log(e));
        },

        // Update data
        put: (data) => {
          http.request({
            url: `${$scope.apiBase}insect_put.php`,
            data: data
          })
          .then(response => {
            if (response.affectedRows) {
              methods.get();
              $timeout(() => {
                alert("Adat módosítása sikerült!");
              }, 300);
            } else alert("Adat módosítása nem sikerült!");
          })
          .catch(e => console.log(e));
        },

        // Delete data
        delete: (id) => {
          http.request({
            url: `${$scope.apiBase}insect_delete.php`,
            data: {id: id}
          })
          .then(response => {
            if (response.affectedRows) {
              methods.get();
              $timeout(() => {
                alert("Adat törlése sikerült!");
              }, 300);
            } else alert("Adat törlése nem sikerült!");
          })
          .catch(e => console.log(e));
        },

        // Read image
        readImage: () => {
          const reader = new FileReader();
          reader.onload = (e) => {
            methods.setImage(util.getBase64UrlData(e.target.result), 
                             $scope.model.image.type);
          };
          reader.onerror = () => {
            console.log('File read error!');
          };
          reader.readAsDataURL($scope.model.image);
        },

        // Set image
        setImage: (img=null, type=null) => {
          $scope.model.img = img;
          $scope.model.img_type = type;
          if (!img && !type) $scope.model.image = null;
          $scope.$applyAsync();
        },

        // Clone object
        clone: (obj) => JSON.parse(JSON.stringify(obj)),

        // Offcanvas initialize
        offcanvasInit: () => {
          $timeout(() => {
            const offcanvasElement = document.querySelector("#offcanvasTop");
            if (offcanvasElement)
              $scope.helper.offcanvas = new bootstrap.Offcanvas(offcanvasElement);

            // Events
            methods.events();
          }, 100);
        },

        // Offcanvas close
        offcanvasClose: () => {
          if ($scope.helper.offcanvas)
            $scope.helper.offcanvas.hide();
        }
      };

      // Set scope methods
      $scope.methods = {

        // Set model
        setModel: (data=null) => {
          $scope.model = methods.clone(data === null ? $scope.helper.model : data);
          $scope.helper.isNew = data === null;
          if ($scope.helper.isNew) methods.offcanvasClose();
          $scope.$applyAsync();
        },

        // POST
        post: () => {
          const { $$hashKey, image, ...data } = $scope.model;
          methods.post(data);
        },

        // PUT
        put: () => {
          if (confirm("Biztossan módosítja az adatot?")) {
            const { $$hashKey, image, ...data } = $scope.model;
            methods.put(data);
          }
        },

        // DELETE
        delete: (id) => {
          if (confirm("Biztossan törli az adatot?")) {
            methods.delete(id);
          }
        },

        // Cancel
        cancel: () => methods.get(),

        // Image
        image: methods.readImage,

        // Clear image
        clearImg: () => methods.setImage(),

        // Toggle theme
        toggleTheme: () => {
          $rootScope.theme = $rootScope.theme === "dark" ? "light" : "dark";
          localStorage.setItem($rootScope.pageID + "theme", $rootScope.theme);
        },

        // Scroll to top page
        scrollToTop: () => {
          $timeout(() => {
            const doc = document.querySelector('html');
            if (doc && 
              (doc.scrollTop  > 0 || 
                doc.scrollLeft > 0 ))
                doc.scrollTo(0, 0);
          }, 100);
        }
      };

      // Initialize
      methods.init();
    }
  ])

  // File input
  .directive('fileInput', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {

        // Set max image size
        const MAX_IMAGE_KB = 64;

        // Get function on change
        const onChangeHandler = scope.$eval(attrs.fileInput);

        // Set event on change
        element.on("change", () => {

          // Check is file selected
          if (!element[0].files.length) return;

          // Get file
          const file = element[0].files[0];

          // Check file type
          if (!file.type.trim().toLowerCase()
                               .startsWith("image/")) {
            alert('Invalid file type!');
            return;
          }

          // Check file size
          if (file.size > MAX_IMAGE_KB * 1024) {
            alert('Invalid file size!');
            return;
          }

          // Set model
          ngModel.$setViewValue(file);
          
          // Render value to model
          ngModel.$render();

          // Call function on change
          onChangeHandler();
        });

        // Reset events
        element.on('$destroy', () => {
          element.off();
        });
      }
    };
  });

})(window, angular);