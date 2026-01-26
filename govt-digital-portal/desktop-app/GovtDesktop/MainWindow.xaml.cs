using System.Globalization;
using System.Windows;
using System.Windows.Data;
using System.Windows.Media;
using GovtDesktop.ViewModels;

namespace GovtDesktop
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private async void OnCreateFolderClick(object sender, RoutedEventArgs e)
        {
            // Simple replacement for Input Dialog
            // In a real app, use a dedicated Window
            string folderName = "New Folder"; 
            var vm = (MainViewModel)DataContext;
            await vm.CreateFolder(folderName);
        }

        private void OnUploadClick(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Drag and Drop implemented in View or use File Open Dialog.");
        }
    }

    public class FolderColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool isFolder && isFolder)
                return Brushes.Orange; // Folder color
            return Brushes.LightBlue; // File color
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
