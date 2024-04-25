
function sendVideoUrl(element) {
    const videoUrl = element.getAttribute('video-url');
    const backendEndpoint = `/play?videoUrl=${encodeURIComponent(videoUrl)}`;
    window.location.href = backendEndpoint;
}

function freeVideoUrl(element) {
    const videoUrl = element.getAttribute('video-url');
    window.location.href = videoUrl;
}

function downloadPdf(url, filename) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
}


document.addEventListener('DOMContentLoaded', async function () {
    const buttons = document.querySelectorAll('.list button');

    buttons.forEach(button => {
        button.addEventListener('click', async function () {
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('inactive');
            });
            this.classList.remove('inactive');
            this.classList.add('active');

            const contentParagraphs = document.querySelectorAll('#content div');
            contentParagraphs.forEach(paragraph => {
                paragraph.style.display = 'none';
            });

            const buttonId = this.id;
            const contentId = `${buttonId}-content`;
            const contentElement = document.getElementById(contentId);
            if (contentElement) {
                const batchNameSlug = contentElement.getAttribute("batchNameSlug")
                const subjectSlug = contentElement.getAttribute("subjectSlug")
                const chapterSlug = contentElement.getAttribute("chapterSlug")
                contentElement.style.display = 'block';
                console.log(contentElement)
                const contentElementContainer = document.querySelector(`#${contentId} .container`);
                const url = `/saved/batches/${batchNameSlug}/subject/${subjectSlug}/contents/${chapterSlug}/${buttonId}`;
                try {
                    const response = await fetch(url);
                    if (buttonId == "lectures" || buttonId == "dppVideos") {
                        const videosBatch = await response.json();
                        let videos = buttonId == "lectures" ? videosBatch.videosSch :  videosBatch.dppVideosSch
                        if (videos.length > 0) {
                            videos.forEach(video => {
                                contentElementContainer.innerHTML += `
                    <div class="video-card" onclick="${video.videoDetails.videoUrl ? 'sendVideoUrl(this)' : 'freeVideoUrl(this)'}" video-url="${video.videoDetails.videoUrl ? video.videoDetails.videoUrl : video.videoDetails.embedCode}">
                        <div class="thumbnail-container">
                            <img class="thumbnail" src="${video.videoDetails.image}" alt="Thumbnail">
                            <img class="play-icon" src="/images/blue-play-icon.svg" alt="Play icon">
                        </div>
                        <div class="info">
                            <div class="info__time">
                                <div class="date">${video.date}</div>
                                <div class="duration">
                                    <img class="clock-icon" src="/images/clock.svg" alt="Clock">
                                    <span>${video.videoDetails.duration}</span>
                                </div>
                            </div>
                            <p class="title">${video.videoDetails.name.split(' ').length > 10 ? video.videoDetails.name.split(' ').slice(0, 10).join(' ') + ' ...' : video.videoDetails.name}</p>
                        </div>
                    </div>`;

                            });
                        } else {
                            contentElementContainer.innerHTML = `<img src="/images/coming-soon.png" alt="">`
                        }
                    }
                    else if (buttonId == 'notes' || buttonId == 'dpp') {
                        const videoNotes = await response.json();
                        let videos = buttonId == "notes" ? videoNotes.notesSch :  videoNotes.dppSch
                        if (videos.length > 0) {
                            videos.forEach(pdf => {
                                contentElementContainer.innerHTML += `
                                    <div class="container" onclick="downloadPdf('${pdf.pdfUrl}', '${pdf.pdfName}')">
                                        <div class="card__pdf">
                                            <div class="content__pdf">
                                                <p class="attachment-text">${pdf.topic.split(' ').length > 10 ? pdf.topic.split(' ').slice(0, 10).join(' ') + ' ...' : pdf.topic}</p>
                                            </div>
                                            <div class="play-div">
                                                <i class="ri-file-pdf-2-fill"></i>
                                                <i class="ri-download-fill"></i>
                                            </div>
                                        </div>
                                    </div>
                            `;
                            });
                        } else {
                            contentElementContainer.innerHTML = `<img src="/images/coming-soon.png" alt="">`
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }

            }
        });
    });
});
