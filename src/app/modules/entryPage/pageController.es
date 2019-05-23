/**
 * Copyright (c) 2019 Callan Peter Milne
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */

angular.module('MyJournalWebui.EntryPage')
  .controller('EntryPageController', EntryPageController);

EntryPageController.$inject = ['$api', '$scope', '$state', '$mdDialog', '$timeout', 'entry'];
function EntryPageController (  $api,   $scope,   $state,   $mdDialog,   $timeout,   entry) {

  const $entryPage = this;

  $entryPage.entry = entry;

  $entryPage.navToParent = function ($event) {
    navToParent();
  };

  $entryPage.deleteEntry = function ($event) {

    let confirm = $mdDialog.confirm()
      .title('Are you sure?')
      .textContent('This will permanently delete your entry: ' + entry.Summary)
      .ariaLabel('Delete entry')
      .targetEvent($event)
      .ok('Delete Entry')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      deleteEntry(entry.Id);
    }, function() {
      // do nothing
    });

  };

  $entryPage.changeSummary = function ($event) {

    let changeEntrySummaryDialog = {
      controller: 'ChangeEntrySummaryDialogController',
      templateUrl: 'modules/entryPage/html/dialogs/changeSummary.html',
      parent: angular.element(document.body),
      targetEvent: $event,
      clickOutsideToClose: true,
      fullscreen: true,
      locals: {
        entry: entry,
      },
    };

    $mdDialog.show(changeEntrySummaryDialog).then(function(newValue) {
      changeSummary(entry.Id, newValue);
    }, function() {

    });

  };

  $entryPage.changeOccurred = function ($event) {

    let changeEntryOccurredDialog = {
      controller: 'ChangeEntryOccurredDialogController',
      templateUrl: 'modules/entryPage/html/dialogs/changeOccurred.html',
      parent: angular.element(document.body),
      targetEvent: $event,
      clickOutsideToClose: true,
      fullscreen: true,
      locals: {
        entry: entry,
      },
    };

    $mdDialog.show(changeEntryOccurredDialog).then(function(newValue) {
      changeOccurred(entry.Id, Math.round(newValue/1000));
    }, function() {

    });

  };

  function changeSummary (entryId, newValue) {
    if (entry.Id !== entryId) {
      return;
    }

    $api.apiPutNewValue(`/entry/${entryId}/summary`, newValue)
      .then(function (res) {
        updateEntrySummary(newValue);
      })
      .catch(function (err) {
        console.log(err);
        notifyUpdateEntryError();
      });
  }

  function updateEntrySummary (newValue) {
    $scope.$apply(function () {
      entry.Summary = newValue;
    });
  }

  function changeOccurred (entryId, newValue) {
    if (entry.Id !== entryId) {
      return;
    }

    $api.apiPutNewValue(`/entry/${entryId}/occurred`, newValue)
      .then(function (res) {
        updateEntryOccurred(newValue);
      })
      .catch(function (err) {
        console.log(err);
        notifyUpdateEntryError();
      });
  }

  function updateEntryOccurred (newValue) {
    $scope.$apply(function () {
      entry.Occurred = newValue;
    });
  }

  function deleteEntry (entryId) {
    if (entry.Id !== entryId) {
      return;
    }

    $api.apiDelete(`/entry/${entryId}`)
      .then(function (res) {
        navToParent();
      })
      .catch(function (err) {
        console.log(err);
        notifyDeleteEntryError();
      });
  }

  function notifyDeleteEntryError () {
    $mdDialog.show(
      $mdDialog.alert()
        .title('Error')
        .textContent('An unexpected error was encountered while deleting the entry.')
        .ariaLabel('Error notification')
        .ok('Ok')
    );
  }

  function notifyUpdateEntryError () {
    $mdDialog.show(
      $mdDialog.alert()
        .title('Error')
        .textContent('An unexpected error was encountered while updating the entry.')
        .ariaLabel('Error notification')
        .ok('Ok')
    );
  }

  function navToParent () {
    $state.go('app.user.journalPage', { journalId: entry.JournalId });
  }

};
