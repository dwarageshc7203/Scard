package me.dwaragesh.backend.fetcher;

import me.dwaragesh.backend.fetcher.dto.PlatformSyncResult;
import me.dwaragesh.backend.model.enums.Platform;

public interface PlatformFetcher {

    Platform platform();
    PlatformSyncResult fetch(String platformUsername);

}
