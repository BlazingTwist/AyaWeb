import {createElement, useState} from 'react'
import styles from './fileExplorer.module.css';

/**
 * @typedef File
 * @property name
 */
/**
 * @typedef Directory
 * @property {string} name
 * @property {File[]} files
 * @property {Directory[]} directories
 */

/**
 * @typedef StateCallbacks
 * @property {IsDirectoryOpen} isDirectoryOpen
 * @property {SetDirectoryOpen} setDirectoryOpen
 * @property {IsFileSelected} isFileSelected
 * @property {SelectSingleFile} selectSingleFile
 * @property {SelectFile} selectFile
 */

/**
 * @param {Directory} files
 * @constructor
 */
export default function FileExplorer(files) {
    let [openDirKeys, setOpenDirKeys] = useState({});
    let [selectedKeys, setSelectedKeys] = useState({});

    function setOpenedStateForAll(doOpen) {
        let newOpenDirKeys = {};
        /**
         * @param {string} keyPrefix
         * @param {Directory} dir
         * @param {boolean} doOpen
         * @private
         */
        function _setOpenedStateForAll(keyPrefix, dir, doOpen) {
            const key = `${keyPrefix}.${dir.name}`;
            newOpenDirKeys[key] = doOpen;
            for (let subDir of dir.directories) {
                _setOpenedStateForAll(key, subDir, doOpen);
            }
        }

        for (let directory of files.directories) {
            _setOpenedStateForAll("", directory, doOpen);
        }
        setOpenDirKeys(newOpenDirKeys);
        console.log("new open state: " + JSON.stringify(newOpenDirKeys));
    }

    /**
     * @callback IsDirectoryOpen
     * @param {string} dirKey
     * @returns {boolean}
     */
    function isDirectoryOpen(dirKey) {
        return openDirKeys[dirKey] || false;
    }

    /**
     * @callback SetDirectoryOpen
     * @param {string} dirKey
     * @param {boolean} doOpen
     */
    function setDirectoryOpen(dirKey, doOpen) {
        let openDirKeys2 = Object.assign({}, openDirKeys);
        openDirKeys2[dirKey] = doOpen;
        setOpenDirKeys(openDirKeys2);
    }

    /**
     * @callback IsFileSelected
     * @param {string} fileKey
     */
    function isFileSelected(fileKey) {
        return selectedKeys[fileKey] || false;
    }

    /**
     * @callback SelectSingleFile
     * @param {string} fileKey
     */
    function selectSingleFile(fileKey) {
        let selectedKeys2 = {};
        selectedKeys2[fileKey] = true;
        setSelectedKeys(selectedKeys2);
    }

    /**
     * @callback SelectFile
     * @param {string} fileKey
     * @param {boolean} doSelect true to select, false to de-select.
     */
    function selectFile(fileKey, doSelect) {
        let selectedKeys2 = Object.assign({}, selectedKeys);
        selectedKeys2[fileKey] = doSelect;
        setSelectedKeys(selectedKeys2);
    }

    /** @type {StateCallbacks} */
    const callbacks = {
        isDirectoryOpen, setDirectoryOpen,
        isFileSelected, selectSingleFile, selectFile
    };

    const toolbar = <div className={styles.toolbar}>
        <i className="fa-sm fa-undo disabled"/>
        <i className="fa-sm fa-redo disabled"/>
        <div className={styles.toolbarSeparator}/>
        <i className="fa-sm fa-unfold-all" onClick={() => setOpenedStateForAll(true)}/>
        <i className="fa-sm fa-fold-all" onClick={() => setOpenedStateForAll(false)}/>
    </div>

    return <div className={styles.fileExplMainDiv}>
        {toolbar}
        {DirectoryContent("", files, callbacks)}
    </div>
}

/**
 * @param {string} keyPrefix
 * @param {Directory} files
 * @param {StateCallbacks} callbacks
 * @return {(DirectoryEntry | FileEntry)[]}
 * @constructor
 */
function DirectoryContent(keyPrefix, files, callbacks) {
    return [].concat(files.directories.map(dir => new DirectoryEntry(keyPrefix, dir, callbacks)))
        .concat(files.files.map(file => new FileEntry(keyPrefix, file, callbacks)));
}

/**
 * @param {string} keyPrefix
 * @param {Directory} directory
 * @param {StateCallbacks} callbacks
 * @constructor
 */
function DirectoryEntry(keyPrefix, directory, callbacks) {
    const key = `${keyPrefix}.${directory.name}`;
    const isSelected = callbacks.isFileSelected(key);
    const isOpened = callbacks.isDirectoryOpen(key);
    const isEmpty = isDirectoryEmpty(directory);

    function toggleOpen() {
        console.log("toggle key: " + key + " | isOpen: " + isOpened);
        callbacks.setDirectoryOpen(key, !isOpened);
    }

    const angleButtonProps = {className: "fa-sm"};
    if (!isEmpty) {
        angleButtonProps.className += isOpened ? " fa-angle-down" : " fa-angle-right"
        angleButtonProps.onClick = toggleOpen;
    }
    const angleButton = createElement('i', angleButtonProps);

    const folderIconProps = {className: "fa-sm"};
    if (isEmpty) {
        folderIconProps.className += " fa-folder-empty";
    } else {
        folderIconProps.className += isOpened ? " fa-folder-open" : " fa-folder-full";
        folderIconProps.onClick = toggleOpen;
    }
    const folderIcon = createElement('i', folderIconProps);

    let folderContent = null;
    if (!isEmpty && isOpened) {
        folderContent = <div className={styles.folderContentDiv}>
            {DirectoryContent(key, directory, callbacks)}
        </div>;
    }

    return <div key={key} className={styles.fileExplDirectoryDiv}>
        <div className={`${styles.fileExplDirectoryHeader} ${isSelected ? styles.selected : ""}`}
             onDoubleClick={isEmpty ? null : toggleOpen}
             onClick={() => callbacks.selectSingleFile(key)}>
            {angleButton}
            {folderIcon}
            <span className={styles.folderName}>{directory.name}</span>
        </div>
        {folderContent}
    </div>
}

/**
 * @param {string} keyPrefix
 * @param {File} file
 * @param {StateCallbacks} callbacks
 * @constructor
 */
function FileEntry(keyPrefix, file, callbacks) {
    const key = `${keyPrefix}.${file.name}`;
    const isSelected = callbacks.isFileSelected(key);
    return <div key={key}
                className={`${styles.fileExplFileDiv} ${isSelected ? styles.selected : ""}`}
                onClick={() => callbacks.selectSingleFile(key)}>
        <div className="fa-sm"/>
        <i className="fa-sm fa-file"/>
        <span className={styles.fileName}>{file.name}</span>
    </div>
}

function isDirectoryEmpty(dir) {
    return dir.files.length === 0 && dir.directories.length === 0;
}