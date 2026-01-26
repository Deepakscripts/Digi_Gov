# Government Digital Portal - Windows Desktop App

This is a **native Windows Presentation Foundation (WPF)** application converted from the React frontend.
It is designed to communicate with the existing Node.js backend running at `http://localhost:5000`.

## Prerequisites (Windows)
1. **.NET 8 SDK** installed.
2. Visual Studio 2022 (with .NET Desktop Development workload).

## Project Structure
- **Models**: Maps to the backend JSON responses (e.g., `FileItem`).
- **Services**: `ApiService` uses `HttpClient` to replace `axios` calls.
- **ViewModels**: `MainViewModel` replaces the React `FileExplorer` component logic (State -> ObservableProperties).
- **Views**: `MainWindow.xaml` replaces the JSX layout.

## How to Run
1. Ensure your **Backend server** is running (`npm start` in the `backend` folder).
2. Open `GovtDesktop.csproj` in Visual Studio or run:
   ```bash
   dotnet run
   ```
   (Must be on Windows).

## Features Ported
- **File Explorer**: Browse folders, view files.
- **Search**: Search API integration.
- **Breadcrumbs**: Navigation logic.
- **Create Folder**: Basic implementation.
- **API Integration**: Connects to localhost:5000.

## Next Steps to Convert "Whole Website"
To complete the conversion for other pages (Notices, Notifications):
1. Create a `Notice` model in `Models/`.
2. Add `GetNoticesAsync` in `ApiService`.
3. Create `NoticesViewModel`.
4. Create `NoticesPage.xaml` (using WPF Page or UserControl).
5. Add navigation in `MainWindow` to switch between Drive and Notices.
