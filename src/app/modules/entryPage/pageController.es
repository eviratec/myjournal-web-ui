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

  $entryPage.renameEntry = function ($event) {

    var confirm = $mdDialog.prompt()
      .title('Rename Entry')
      .placeholder(entry.Summary)
      .ariaLabel('Entry title')
      .initialValue(entry.Summary)
      .targetEvent($event)
      .ok('Save')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function(newValue) {
      renameEntry(entry.Id, newValue);
    }, function() {
      // do nothing
    });

  };

  function renameEntry (entryId, newValue) {
    if (entry.Id !== entryId) {
      return;
    }

    $api.apiPutNewValue(`/entry/${entryId}/summary`, newValue)
      .then(function (res) {
        updateEntrySummary(newValue);
      })
      .catch(function (err) {
        console.log(err);
        notifyRenameEntryError();
      });
  }

  function updateEntrySummary (newValue) {
    $scope.$apply(function () {
      entry.Summary = newValue;
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

  function notifyRenameEntryError () {
    $mdDialog.show(
      $mdDialog.alert()
        .title('Error')
        .textContent('An unexpected error was encountered while renaming the entry.')
        .ariaLabel('Error notification')
        .ok('Ok')
    );
  }

  function navToParent () {
    $state.go('app.user.journalPage', { journalId: entry.JournalId });
  }

};
