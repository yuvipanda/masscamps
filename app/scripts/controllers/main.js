'use strict';

var commonsURL = "https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=content&generator=allpages&gapnamespace=460&gaplimit=max&callback=JSON_CALLBACK";
angular.module('masscampsApp')
    .controller('MainCtrl', ['$scope', '$http', '$sanitize', function ($scope, $http, $sanitize) {

        $scope.displayCampaign = function(iterable) {
            // FIXME: MAKE THIS NOT SUCK!!!1
            // But how does one write recursive templates properly? And without having to convert the
            // dict structure into a tame list type thing, with 'key' and 'value' keys?!
            // Also unsure how to do it properly as a directive
            var result = "<table class='json-table table table-bordered'>";
            if('name' in iterable) {
                result += "<tr><th colspan=2><a href='https://cammons.wikimedia.org/wiki/Campaign" + $sanitize(iterable.name) + "'>" + iterable.name + "</a>";
                result += "<div class='campaign-actions btn-group'>";
                result += "<a href='https://commons.wikimedia.org/wiki/Campaign_talk:" + $sanitize(iterable.name) + "' class='btn' target='_blank'>Talk</a>";
                result += "<a href='https://commons.wikimedia.org/wiki/Campaign:" + $sanitize(iterable.name) + "?action=edit' class='btn' target='_blank'>Edit</a>";
                result += "<a href='https://commons.wikimedia.org/wiki/Campaign:" + $sanitize(iterable.name) + "?action=history' class='btn' target='_blank'>History</a>";
                result += "</div>";

                result += "</th></tr>";
            }

            angular.forEach(iterable, function(value, key) {
                result += "<tr>";
                result += "<td class='key'>" + $sanitize(key.toString()) + "</td>";
                result += "<td class='value'>";
                if(typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                    result += $sanitize(value.toString());
                } else {
                    result += $scope.displayCampaign(value);
                }
                result += "</td></td>";
            });
            result += "</table>";
            return result;
        };

        $scope.refreshCampaigns = function() {
            console.log('starting refresh');
            $http.jsonp(commonsURL).success(function(data) {
                $scope.campaigns = [];
                angular.forEach(data.query.pages, function(page, id) {
                    var campaign = JSON.parse(page.revisions[0]['*']);
                    campaign.name = page.title.split(':')[1];
                    $scope.campaigns.push(campaign);
                });
                console.log('refresh completed');
            }).error(function(data, status, header, config) {
                $scope.campaigns = [];
            });
        };

        $scope.refreshCampaigns();

        $scope.campaignFilter = function(campaign) {
            return campaign.name.indexOf($scope.search) === 0 && campaign.enabled !== $scope.hideDisabled;
        };
    }]);
