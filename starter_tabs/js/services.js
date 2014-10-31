angular.module('praetor.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' },
    { id: 4, name: 'Scruff McGruff' },
    { id: 5, name: 'G.I. Joe' },
    { id: 6, name: 'Miss Frizzle' },
    { id: 7, name: 'Ash Ketchum' },
    { id: 8, name: 'Scruff McGruff' },
    { id: 9, name: 'G.I. Joe' },
    { id: 12, name: 'Miss Frizzle' },
    { id: 13, name: 'Ash Ketchum' },
    { id: 10, name: 'Scruff McGruff' },
    { id: 11, name: 'G.I. Joe' },
    { id: 22, name: 'Miss Frizzle' },
    { id: 23, name: 'Ash Ketchum' },
    { id: 20, name: 'Scruff McGruff' },
    { id: 31, name: 'G.I. Joe' },
    { id: 32, name: 'Miss Frizzle' },
    { id: 33, name: 'Ash Ketchum' },
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
});
